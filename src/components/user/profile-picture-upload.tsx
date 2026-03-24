"use client";

import { useState } from "react";
import Image from "next/image";
import { UploadButton } from "@uploadthing/react";
import { Camera, Upload } from "lucide-react";
import type { OurFileRouter } from "~/lib/uploadthing";

interface ProfilePictureProps {
  currentImage?: string;
  firstName?: string;
  onUploadComplete?: (url: string) => void;
}

export function ProfilePictureUpload({
  currentImage = "/profile/default_profile.jpg",
  firstName = "User",
  onUploadComplete,
}: ProfilePictureProps) {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="flex flex-col items-center gap-8 py-4">
      {/* Profile Picture Display with Overlay */}
      <div className="group relative">
        <div className="relative h-40 w-40 overflow-hidden rounded-full shadow-lg ring-4 ring-white transition-transform duration-300 group-hover:scale-105 dark:ring-slate-800">
          <Image
            src={currentImage}
            alt={`${firstName}'s profile picture`}
            fill
            className="object-cover"
            priority
          />
          {/* Hover Overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <Upload size={28} className="text-white/90" strokeWidth={2} />
          </div>
        </div>
      </div>

      {/* Upload Section */}
      <div className="flex w-full max-w-xs flex-col gap-3">
        <UploadButton<OurFileRouter>
          endpoint="profileImage"
          onClientUploadComplete={(res) => {
            if (res?.[0]?.url) {
              onUploadComplete?.(res[0].url);
              setIsLoading(false);
            }
          }}
          onUploadError={(error: Error) => {
            alert(`Upload failed: ${error.message}`);
            setIsLoading(false);
          }}
          onUploadBegin={() => {
            setIsLoading(true);
          }}
          appearance={{
            button: `
              w-full bg-[#f1c44f] hover:bg-[#f1b835] text-[#071d3a] font-medium py-2.5 px-4
              rounded-lg transition-all duration-300 active:scale-95 shadow-md hover:shadow-lg
              disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2
            `,
            container: "w-full",
            allowedContent: "hidden",
          }}
          content={{
            button: isLoading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#071d3a]/30 border-t-[#071d3a]" />
                Uploading...
              </>
            ) : (
              <>
                <Upload size={18} />
                Change Picture
              </>
            ),
          }}
        />
        <p className="text-center text-xs leading-relaxed text-slate-500">
          JPG or PNG, max 4MB
        </p>
      </div>
    </div>
  );
}
