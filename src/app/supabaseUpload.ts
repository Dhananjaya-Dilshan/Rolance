import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const configId = formData.get('configId') || ''

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const fileName = `${Date.now()}_${file.name}`
    const { data, error } = await supabase.storage
      .from('uploads')
      .upload(fileName, file)

    if (error) {
      console.error(error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const publicUrl = supabase.storage.from('uploads').getPublicUrl(data.path)

    return NextResponse.json({ publicUrl: publicUrl.publicUrl, configId })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
