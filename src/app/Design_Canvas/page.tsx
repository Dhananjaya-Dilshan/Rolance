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
  metadata?: any;
  createdAt: string;
  updatedAt: string;
  customer: {
    id: string;
    email: string;
  };
}

const DesignCanvasPage = () => {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [canvasDesign, setCanvasDesign] = useState<CanvasDesign | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [permission, setPermission] = useState<"view" | "edit">("view");
  const [shareEmail, setShareEmail] = useState<string | null>(null);

  // Retrieve user info from localStorage
  useEffect(() => {
    const userString = localStorage.getItem("user");
    if (userString) {
      try {
        const user = JSON.parse(userString);
        setCustomerId(user.id);
        setUserEmail(user.email); // Make sure this is setting the email
        if (!user.email) {
          console.error("User email not found in user object");
        }
      } catch (err) {
        console.error("Error parsing user from localStorage:", err);
        setError("Failed to load user data");
      }
    } else {
      
      setError("Please log in to access this page");
    }
  }, []);

  // Load canvas design if token is present
  useEffect(() => {
    if (token) {
      fetch(`/api/canvas/load?token=${token}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.error) {
            setError(data.error);
          } else if (data.canvas) {
            setCanvasDesign(data.canvas);
            setPermission(data.permission);
            setShareEmail(data.shareEmail);
            setError(null);
          }
        })
        .catch((err) => {
          console.error("Error loading canvas design:", err);
          setError("Failed to load design");
        });
    }
  }, [token]);

  // Verify authorization
  const isAuthorized = () => {
    if (!canvasDesign || !userEmail) return false;
    
    // Original owner
    if (canvasDesign.customerId === customerId) return true;
    
    // Shared with edit permission and matching email
    if (permission === "edit" && shareEmail === userEmail) return true;
    
    return false;
  };

  // Render logic
  if (!customerId) {
    return <div>Please log in to access this page.</div>;
  }

  if (token && !canvasDesign && !error) {
    return <div>Loading design...</div>;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      </div>
    );
  }

  // Check authorization
  if (canvasDesign && !isAuthorized()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          You are not authorized to view or edit this design.
        </div>
      </div>
    );
  }

  return (
    <AuthProtection requiredRole="customer">
      <DesignCanvas
        initialDesign={canvasDesign}
        token={token}
        customerId={customerId}
        userEmail={userEmail}
        permission={permission}
      />
    </AuthProtection>
  );
};

export default DesignCanvasPage;