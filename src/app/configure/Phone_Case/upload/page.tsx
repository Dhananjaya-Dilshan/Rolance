'use client'
import { useEffect, useState, useCallback } from "react";
import { Progress } from '@/components/ui/progress';
import { useToast } from "@/hooks/use-toast";
import { useUploadThing } from '@/lib/uploadthing';
import { cn } from '@/lib/utils';
import { Image, Loader2, MousePointerSquareDashed } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Dropzone, { FileRejection } from 'react-dropzone';

const Page = () => {
  const { toast } = useToast();
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const router = useRouter();

  const { startUpload, isUploading } = useUploadThing('imageUploader', {
    onClientUploadComplete: ([data]) => {
      const configId = data.serverData.configId;
      router.push(`/configure/Phone_Case/design?id=${configId}`);
    },
    onUploadProgress(p) {
      setUploadProgress(p);
    },
  });

  const autoUploadExportedImage = useCallback(() => {
    const exportedImage = sessionStorage.getItem("exportedImage");

    if (exportedImage) {
      fetch(exportedImage)
        .then(res => res.blob())
        .then(blob => {
          if (blob.size === 0) {
            console.error("Exported image is empty.");
            return;
          }

          const file = new File([blob], "exported-design.png", { type: "image/png" });

          return startUpload([file], { configId: undefined })
            .then(() => {
              sessionStorage.removeItem("exportedImage");
            })
            .catch(err => console.error("Upload failed:", err));
        })
        .catch(err => console.error("Error loading exported image:", err));
    }
  }, [startUpload]);

  useEffect(() => {
    // Wrap the auto-upload in a timeout to ensure it doesn't conflict with other uploads
    const timeoutId = setTimeout(autoUploadExportedImage, 100);
    
    // Cleanup timeout if component unmounts
    return () => clearTimeout(timeoutId);
  }, [autoUploadExportedImage]);

  const onDropRejected = (rejectedFiles: FileRejection[]) => {
    toast({
      title: `${rejectedFiles[0].file.type} type is not supported.`,
      description: "Please choose a PNG, JPG, or JPEG image instead.",
      variant: "destructive",
    });
    setIsDragOver(false);
  };

  const onDropAccepted = (acceptedFiles: File[]) => {
    startUpload(acceptedFiles, { configId: undefined });
    setIsDragOver(false);
  };

  return (
    <div className={cn(
      'relative h-full flex-1 my-16 w-full rounded-xl bg-gray-900/5 p-2 ring-1 ring-inset ring-gray-900/10 lg:rounded-2xl flex justify-center flex-col items-center',
      { 'ring-blue-900/25 bg-blue-900/10': isDragOver }
    )}>
      <div className='relative flex flex-1 flex-col items-center justify-center w-full'>
        <Dropzone
          onDropRejected={onDropRejected}
          onDropAccepted={onDropAccepted}
          accept={{
            'image/png': ['.png'],
            'image/jpeg': ['.jpeg'],
            'image/jpg': ['.jpg'],
          }}
          onDragEnter={() => setIsDragOver(true)}
          onDragLeave={() => setIsDragOver(false)}>
          {({ getRootProps, getInputProps }) => (
            <div className='h-full w-full flex-1 flex flex-col items-center justify-center' {...getRootProps()}>
              <input {...getInputProps()} />
              {isDragOver ? (
                <MousePointerSquareDashed className='h-6 w-6 text-zinc-500 mb-2' />
              ) : isUploading ? (
                <Loader2 className='animate-spin h-6 w-6 text-zinc-500 mb-2' />
              ) : (
                <Image className='h-6 w-6 text-zinc-500 mb-2' />
              )}

              <div className='flex flex-col justify-center mb-2 text-sm text-zinc-700'>
                {isUploading ? (
                  <div className='flex flex-col items-center'>
                    <p>Uploading...</p>
                    <Progress value={uploadProgress} className='mt-2 w-40 h-2 bg-gray-300' />
                  </div>
                ) : isDragOver ? (
                  <p><span className='font-semibold'>Drop file</span> to upload</p>
                ) : (
                  <p><span className='font-semibold'>Click to upload</span> or drag and drop</p>
                )}
              </div>

              <p className='text-xs text-zinc-500'>PNG, JPG, JPEG</p>
            </div>
          )}
        </Dropzone>
      </div>
    </div>
  );
};

export default Page;