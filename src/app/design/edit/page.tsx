"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import DesignCanvas from "@/components/DesignCanvas";
import AuthProtection from "@/components/AuthProtection";

interface CanvasDesign {
  id: string;
  customerId: string;
  title: string;
  elements?: any;
  lines?: any;
  images?: any;
  createdAt: string;
  updatedAt: string;
}

const DesignEditPage = () => {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [canvasDesign, setCanvasDesign] = useState<CanvasDesign | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      fetch(`/api/canvas/load?token=${token}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.error) {
            setError(data.error);
          } else if (data.canvas) {
            setCanvasDesign(data.canvas);
          }
        })
        .catch((err) => {
          console.error("Error loading canvas design:", err);
          setError("Failed to load design");
        });
    }
  }, [token]);

  return (
    <AuthProtection requiredRole="customer">
      {(user) => {
        if (!user) {
          return <div>Please log in to access this design.</div>;
        }

        // Verify the customer owns the design or has permission
        if (canvasDesign && canvasDesign.customerId !== user.id) {
          return (
            <div className="min-h-screen flex items-center justify-center">
              <div className="p-4 bg-red-100 text-red-700 rounded">
                You are not authorized to access this design.
              </div>
            </div>
          );
        }

        if (error) {
          return (
            <div className="min-h-screen flex items-center justify-center">
              <div className="p-4 bg-red-100 text-red-700 rounded">{error}</div>
            </div>
          );
        }

        return (
          <DesignCanvas
            initialDesign={canvasDesign}
            token={token}
            customerId={user.id}
          />
        );
      }}
    </AuthProtection>
  );
};

export default DesignEditPage;