'use server'

import { db } from '@/db'
import { CaseFinish, CaseMaterial, PhoneModel } from '@prisma/client'

export type SaveConfigArgs = {
  color: string 
  finish: CaseFinish
  material: CaseMaterial
  model: PhoneModel
  configId: string
  productType?: string 
}

export async function saveConfig({
  color,
  finish,
  material,
  model,
  configId,
  productType = "phone_case", 
}: SaveConfigArgs) {
  await db.configuration.update({
    where: { id: configId },
    data: { color, finish, material, model, productType },
  })
}