'use client'

import HandleComponent from '@/components/HandleComponent'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn, formatPrice } from '@/lib/utils'
import NextImage from 'next/image'
import { Rnd } from 'react-rnd'
import { RadioGroup } from '@headlessui/react'
import { useRef, useState } from 'react'
import { TSHIRT_FINISHES, TSHIRT_MATERIALS, TSHIRT_SIZES } from '@/validators/option-validator'
import { Label } from '@/components/ui/label'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { ArrowRight, Check, ChevronsUpDown } from 'lucide-react'
import { BASE_PRICE } from '@/config/products'
import { useUploadThing } from '@/lib/uploadthing'
import { useToast } from '@/hooks/use-toast'
import { useMutation } from '@tanstack/react-query'
import { saveConfig as _saveConfig, SaveConfigArgs } from './actions'
import { useRouter } from 'next/navigation'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, useGLTF } from '@react-three/drei'
import * as THREE from 'three'

interface DesignConfiguratorProps {
  configId: string
  imageUrl: string
  imageDimensions: { width: number; height: number }
}

const TShirt3D = ({ textureUrl, side }: { textureUrl: string; side: 'front' | 'back' }) => {
  const { scene } = useGLTF('/models/tshirt/uploads_files_3704025_High+Neck+T-shirt.glb') // Adjust path to your 3D model
  useEffect(() => {
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const material = child.material as THREE.MeshStandardMaterial
        material.map = new THREE.TextureLoader().load(textureUrl)
        // Position texture based on side (simplified; adjust UV mapping in model if needed)
        material.map.flipY = false
        material.needsUpdate = true
      }
    })
  }, [scene, textureUrl, side])
  return <primitive object={scene} scale={0.5} />
}

const DesignConfigurator = ({
  configId,
  imageUrl,
  imageDimensions,
}: DesignConfiguratorProps) => {
  const { toast } = useToast()
  const router = useRouter()

  const { mutate: saveConfig, isPending } = useMutation({
    mutationKey: ['save-config'],
    mutationFn: async (args: SaveConfigArgs) => {
      await Promise.all([saveConfiguration(), _saveConfig(args)])
    },
    onError: () => {
      toast({
        title: 'Something went wrong',
        description: 'There was an error on our end. Please try again.',
        variant: 'destructive',
      })
    },
    onSuccess: () => {
      router.push(`/configure/TShirt/preview?id=${configId}`)
    },
  })

  const [options, setOptions] = useState<{
    color: string // Hex color string
    size: (typeof TSHIRT_SIZES.options)[number]
    material: (typeof TSHIRT_MATERIALS.options)[number]
    finish: (typeof TSHIRT_FINISHES.options)[number]
    side: 'front' | 'back'
    mode: '2D' | '3D'
  }>({
    color: '#000000', // Default to black
    size: TSHIRT_SIZES.options[0],
    material: TSHIRT_MATERIALS.options[0],
    finish: TSHIRT_FINISHES.options[0],
    side: 'front',
    mode: '2D',
  })

  const [frontDesign, setFrontDesign] = useState({
    width: imageDimensions.width / 4,
    height: imageDimensions.height / 4,
    x: 150,
    y: 150,
  })

  const [backDesign, setBackDesign] = useState({
    width: imageDimensions.width / 4,
    height: imageDimensions.height / 4,
    x: 150,
    y: 150,
  })

  const tshirtRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const { startUpload } = useUploadThing('imageUploader')

  async function saveConfiguration() {
    try {
      const {
        left: tshirtLeft,
        top: tshirtTop,
        width,
        height,
      } = tshirtRef.current!.getBoundingClientRect()

      const { left: containerLeft, top: containerTop } =
        containerRef.current!.getBoundingClientRect()

      const leftOffset = tshirtLeft - containerLeft
      const topOffset = tshirtTop - containerTop

      const designs = [
        { side: 'front', position: frontDesign },
        { side: 'back', position: backDesign },
      ]

      const uploadedFiles = await Promise.all(
        designs.map(async ({ side, position }) => {
          const actualX = position.x - leftOffset
          const actualY = position.y - topOffset

          const canvas = document.createElement('canvas')
          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext('2d')

          const userImage = new Image()
          userImage.crossOrigin = 'anonymous'
          userImage.src = imageUrl
          await new Promise((resolve) => (userImage.onload = resolve))

          ctx?.drawImage(
            userImage,
            actualX,
            actualY,
            position.width,
            position.height
          )

          const base64 = canvas.toDataURL()
          const base64Data = base64.split(',')[1]
          const blob = base64ToBlob(base64Data, 'image/png')
          const file = new File([blob], `${side}-design.png`, { type: 'image/png' })

          return startUpload([file], { configId }).then((res) => ({
            side,
            url: res?.[0].serverData.configId,
          }))
        })
      )

      // Assuming the backend stores front and back URLs separately
      return uploadedFiles
    } catch (err) {
      toast({
        title: 'Something went wrong',
        description: 'There was a problem saving your config, please try again.',
        variant: 'destructive',
      })
    }
  }

  function base64ToBlob(base64: string, mimeType: string) {
    const byteCharacters = atob(base64)
    const byteNumbers = new Array(byteCharacters.length)
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i)
    }
    const byteArray = new Uint8Array(byteNumbers)
    return new Blob([byteArray], { type: mimeType })
  }

  const getTShirtTemplateImage = () => `/template/tshirt/tshirt-${options.side}.png`

  return (
    <div className='relative mt-20 grid grid-cols-1 lg:grid-cols-3 mb-20 pb-20'>
      <div
        ref={containerRef}
        className='relative h-[37.5rem] overflow-hidden col-span-2 w-full max-w-4xl flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-12 text-center focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'>
        {options.mode === '2D' ? (
          <div className='relative w-60 bg-opacity-50 pointer-events-none'>
            <AspectRatio
              ref={tshirtRef}
              ratio={240 / 360} // Adjust based on your T-shirt template dimensions
              className='pointer-events-none relative z-50 w-full'>
              <NextImage
                fill
                alt='tshirt image'
                src={getTShirtTemplateImage()}
                className='pointer-events-none z-50 select-none'
              />
            </AspectRatio>
            <div className='absolute z-40 inset-0 left-[3px] top-px right-[3px] bottom-px rounded-[32px] shadow-[0_0_0_99999px_rgba(229,231,235,0.6)]' />
            <div
              className='absolute inset-0 left-[3px] top-px right-[3px] bottom-px rounded-[32px]'
              style={{ backgroundColor: options.color }}
            />
            <Rnd
              default={options.side === 'front' ? frontDesign : backDesign}
              onReTSHIRT_SIZEStop={(_, __, ref, ___, { x, y }) => {
                const newDimension = {
                  height: parseInt(ref.style.height.slice(0, -2)),
                  width: parseInt(ref.style.width.slice(0, -2)),
                }
                if (options.side === 'front') {
                  setFrontDesign({ ...frontDesign, ...newDimension, x, y })
                } else {
                  setBackDesign({ ...backDesign, ...newDimension, x, y })
                }
              }}
              onDragStop={(_, data) => {
                const { x, y } = data
                if (options.side === 'front') {
                  setFrontDesign({ ...frontDesign, x, y })
                } else {
                  setBackDesign({ ...backDesign, x, y })
                }
              }}
              className='absolute z-20 border-[3px] border-primary'
              lockAspectRatio
              resizeHandleComponent={{
                bottomRight: <HandleComponent />,
                bottomLeft: <HandleComponent />,
                topRight: <HandleComponent />,
                topLeft: <HandleComponent />,
              }}>
              <div className='relative w-full h-full'>
                <NextImage
                  src={imageUrl}
                  fill
                  alt='your image'
                  className='pointer-events-none'
                />
              </div>
            </Rnd>
          </div>
        ) : (
          <Canvas style={{ height: '37.5rem', width: '100%' }}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} />
            <TShirt3D textureUrl={imageUrl} side={options.side} />
            <OrbitControls />
          </Canvas>
        )}
      </div>

      <div className='h-[37.5rem] w-full col-span-full lg:col-span-1 flex flex-col bg-white'>
        <ScrollArea className='relative flex-1 overflow-auto'>
          <div
            aria-hidden='true'
            className='absolute z-10 inset-x-0 bottom-0 h-12 bg-gradient-to-t from-white pointer-events-none'
          />

          <div className='px-8 pb-12 pt-8'>
            <h2 className='tracking-tight font-bold text-3xl'>
              Customize your T-shirt
            </h2>

            <div className='w-full h-px bg-zinc-200 my-6' />

            <div className='relative mt-4 h-full flex flex-col justify-between'>
              <div className='flex flex-col gap-6'>
                {/* Mode Toggle */}
                <Button
                  variant='outline'
                  onClick={() =>
                    setOptions((prev) => ({
                      ...prev,
                      mode: prev.mode === '2D' ? '3D' : '2D',
                    }))
                  }>
                  Switch to {options.mode === '2D' ? '3D' : '2D'} Mode
                </Button>

                {/* Side Toggle */}
                <Button
                  variant='outline'
                  onClick={() =>
                    setOptions((prev) => ({
                      ...prev,
                      side: prev.side === 'front' ? 'back' : 'front',
                    }))
                  }>
                  Design {options.side === 'front' ? 'Back' : 'Front'}
                </Button>

                {/* Color Picker */}
                <div className='flex flex-col gap-3'>
                  <Label>Color</Label>
                  <div className='flex items-center gap-3'>
                    <input
                      type='color'
                      value={options.color}
                      onChange={(e) =>
                        setOptions((prev) => ({
                          ...prev,
                          color: e.target.value,
                        }))
                      }
                      className='w-12 h-12 border-2 border-gray-300 rounded-md cursor-pointer'
                    />
                    <span className='text-sm text-gray-700'>
                      {options.color.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Size Dropdown */}
                <div className='relative flex flex-col gap-3 w-full'>
                  <Label>Size</Label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant='outline'
                        role='combobox'
                        className='w-full justify-between'>
                        {options.size.label}
                        <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {TSHIRT_SIZES.options.map((size) => (
                        <DropdownMenuItem
                          key={size.label}
                          className={cn(
                            'flex text-sm gap-1 items-center p-1.5 cursor-default hover:bg-zinc-100',
                            {
                              'bg-zinc-100': size.label === options.size.label,
                            }
                          )}
                          onClick={() => {
                            setOptions((prev) => ({ ...prev, size }))
                          }}>
                          <Check
                            className={cn(
                              'mr-2 h-4 w-4',
                              size.label === options.size.label
                                ? 'opacity-100'
                                : 'opacity-0'
                            )}
                          />
                          {size.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Material and Finish Radio Groups */}
                {[TSHIRT_MATERIALS, TSHIRT_FINISHES].map(
                  ({ name, options: selectableOptions }) => (
                    <RadioGroup
                      key={name}
                      value={options[name]}
                      onChange={(val) => {
                        setOptions((prev) => ({
                          ...prev,
                          [name]: val,
                        }))
                      }}>
                      <Label>
                        {name.slice(0, 1).toUpperCase() + name.slice(1)}
                      </Label>
                      <div className='mt-3 space-y-4'>
                        {selectableOptions.map((option) => (
                          <RadioGroup.Option
                            key={option.value}
                            value={option}
                            className={({ active, checked }) =>
                              cn(
                                'relative block cursor-pointer rounded-lg bg-white px-6 py-4 shadow-sm border-2 border-zinc-200 focus:outline-none ring-0 focus:ring-0 outline-none sm:flex sm:justify-between',
                                {
                                  'border-primary': active || checked,
                                }
                              )
                            }>
                            <span className='flex items-center'>
                              <span className='flex flex-col text-sm'>
                                <RadioGroup.Label
                                  className='font-medium text-gray-900'
                                  as='span'>
                                  {option.label}
                                </RadioGroup.Label>
                                {option.description ? (
                                  <RadioGroup.Description
                                    as='span'
                                    className='text-gray-500'>
                                    <span className='block sm:inline'>
                                      {option.description}
                                    </span>
                                  </RadioGroup.Description>
                                ) : null}
                              </span>
                            </span>
                            <RadioGroup.Description
                              as='span'
                              className='mt-2 flex text-sm sm:ml-4 sm:mt-0 sm:flex-col sm:text-right'>
                              <span className='font-medium text-gray-900'>
                                {formatPrice(option.price / 100)}
                              </span>
                            </RadioGroup.Description>
                          </RadioGroup.Option>
                        ))}
                      </div>
                    </RadioGroup>
                  )
                )}
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className='w-full px-8 h-16 bg-white'>
          <div className='h-px w-full bg-zinc-200' />
          <div className='w-full h-full flex justify-end items-center'>
            <div className='w-full flex gap-6 items-center'>
              <p className='font-medium whitespace-nowrap'>
                {formatPrice(
                  (BASE_PRICE + options.finish.price + options.material.price) /
                    100
                )}
              </p>
              <Button
                onClick={() =>
                  saveConfig({
                    configId,
                    color: options.color,
                    finish: options.finish.value,
                    material: options.material.value,
                    size: options.size.value, // Changed from model to size
                    productType: 'tshirt',
                  })
                }
                disabled={isPending}
                className='w-full'>
                Continue
                <ArrowRight className='h-4 w-4 ml-1.5 inline' />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DesignConfigurator