import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { supabase } from '@/lib/supabaseClient'
import { analyzeScan } from '@/lib/groq'
import { Button } from '@/components/ui/Button'
import { SpecimenLabel } from '@/components/SpecimenLabel'

const SEVERITY_TO_STATUS = { low: 'healthy', medium: 'watch', high: 'urgent' }
const SEVERITY_TO_STAMP = { low: 'healthy', medium: 'watch', high: 'urgent' }

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result.split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export default function Scan() {
  const location = useLocation()
  const [plants, setPlants] = useState([])
  const [plantId, setPlantId] = useState(location.state?.plantId || '')
  const [scanType, setScanType] = useState('leaf')
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)
  const [matchedProducts, setMatchedProducts] = useState([])

  useEffect(() => {
    supabase
      .from('plants')
      .select('id, name, species')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setPlants(data || [])
        if (!plantId && data?.length) setPlantId(data[0].id)
      })
  }, [])

  function handleFileChange(e) {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
    setResult(null)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!file || !plantId) return

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const plant = plants.find((p) => p.id === plantId)
      const imageBase64 = await fileToBase64(file)

      // 1. Ask Groq Vision + Groq (called directly, no backend) for a diagnosis
      const diagnosis = await analyzeScan({
        imageBase64,
        mimeType: file.type,
        scanType,
        plantName: plant?.name,
        species: plant?.species,
      })

      // 2. Upload the image to Supabase Storage (bucket: scan-images)
      const { data: userData } = await supabase.auth.getUser()
      const filePath = `${userData.user.id}/${Date.now()}-${file.name}`
      let imageUrl = null

      const { error: uploadError } = await supabase.storage
        .from('scan-images')
        .upload(filePath, file)

      if (!uploadError) {
        const { data: publicUrl } = supabase.storage.from('scan-images').getPublicUrl(filePath)
        imageUrl = publicUrl.publicUrl
      }
      // if the bucket doesn't exist yet, we still save the diagnosis without an image

      // 3. Save the scan record
      const { error: insertError } = await supabase.from('scans').insert({
        plant_id: plantId,
        user_id: userData.user.id,
        scan_type: scanType,
        image_url: imageUrl,
        ai_diagnosis: diagnosis.ai_diagnosis,
        detected_issue: diagnosis.detected_issue,
        severity: diagnosis.severity,
        recommended_action: diagnosis.recommended_action,
      })
      if (insertError) throw insertError

      // 4. Update the plant's current status
      await supabase
        .from('plants')
        .update({ current_status: SEVERITY_TO_STATUS[diagnosis.severity] || 'watch' })
        .eq('id', plantId)

      // 5. Look up matching shop products by tag overlap
      if (diagnosis.tags?.length) {
        const { data: products } = await supabase
          .from('products')
          .select('id, name, price, tags')
          .overlaps('tags', diagnosis.tags)
        setMatchedProducts(products || [])
      }

      setResult({ ...diagnosis, plantName: plant?.name })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-3xl">
      <p className="font-mono text-[11px] tracking-[0.15em] text-moss mb-2">SCAN</p>
      <h1 className="font-display text-3xl text-ink mb-1">Diagnose a leaf or root</h1>
      <p className="text-ink/60 mb-8">Groq Vision reads the photo, Groq turns it into a diagnosis and a fix.</p>

      <form onSubmit={handleSubmit} className="border border-ink/10 rounded-card bg-white/60 p-6 space-y-4 mb-8">
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="font-mono text-[10px] tracking-[0.1em] text-ink/50 block mb-1">PLANT</label>
            <select
              required
              value={plantId}
              onChange={(e) => setPlantId(e.target.value)}
              className="w-full border border-ink/15 rounded-card px-3 py-2.5 bg-paper text-sm"
            >
              <option value="" disabled>Select a plant</option>
              {plants.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            {plants.length === 0 && (
              <p className="text-xs text-ink/40 mt-1">Add a plant on the My Plants page first.</p>
            )}
          </div>

          <div>
            <label className="font-mono text-[10px] tracking-[0.1em] text-ink/50 block mb-1">SCAN TYPE</label>
            <select
              value={scanType}
              onChange={(e) => setScanType(e.target.value)}
              className="w-full border border-ink/15 rounded-card px-3 py-2.5 bg-paper text-sm"
            >
              <option value="leaf">Leaf</option>
              <option value="root">Root</option>
            </select>
          </div>
        </div>

        <div>
          <label className="font-mono text-[10px] tracking-[0.1em] text-ink/50 block mb-1">PHOTO</label>
          <input type="file" accept="image/*" required onChange={handleFileChange} className="text-sm" />
        </div>

        {preview && (
          <img src={preview} alt="Selected preview" className="w-40 h-40 object-cover rounded-card border border-ink/10" />
        )}

        {error && (
          <p className="text-alert text-sm bg-alert-light rounded-card px-3 py-2">{error}</p>
        )}

        <Button type="submit" disabled={loading || !plantId}>
          {loading ? 'Analyzing…' : 'Run diagnosis'}
        </Button>
      </form>

      {result && (
        <>
          <SpecimenLabel
            title={result.plantName}
            subtitle={`${scanType === 'leaf' ? 'Leaf' : 'Root'} scan · just now`}
            status={SEVERITY_TO_STAMP[result.severity] || 'watch'}
            rows={[
              { label: 'ISSUE', value: result.detected_issue },
              { label: 'DIAGNOSIS', value: result.ai_diagnosis },
              { label: 'RX', value: result.recommended_action },
            ]}
            className="mb-6"
          />

          {matchedProducts.length > 0 && (
            <div className="border border-ink/10 rounded-card bg-white/60 p-6">
              <p className="font-mono text-[11px] tracking-[0.1em] text-ink/50 mb-3">RECOMMENDED FOR THIS ISSUE</p>
              <ul className="space-y-2">
                {matchedProducts.map((p) => (
                  <li key={p.id} className="flex justify-between text-sm">
                    <span className="text-ink/80">{p.name}</span>
                    <span className="font-mono text-moss">₹{p.price}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  )
}
