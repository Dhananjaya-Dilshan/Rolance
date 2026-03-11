import React, { useEffect, useRef, useState } from "react";
import { Stage, Layer, Line, Rect, Text, Image, Transformer, Circle } from "react-konva";
import { v4 as uuidv4 } from "uuid";
import { useRouter } from "next/navigation";
import {
  Pencil, Square, Circle as CircleIcon, Type, Eraser, Move, Image as ImageIcon,
  Undo2, Redo2, Trash2, Download, Upload, SprayCan, XCircle, Palette, Shirt,
  Smartphone, Coffee,Copy, Check
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";


export function DesignSuccessDialog({ 
  isOpen, 
  onClose, 
  designLink, 
  successMessage 
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(designLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Design Created Successfully!</AlertDialogTitle>
          <AlertDialogDescription>
            {successMessage}
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        {designLink && (
          <div className="flex items-center space-x-2 mt-4">
            <Input 
              value={designLink} 
              readOnly 
              className="flex-1" 
            />
            <Button 
              variant="outline" 
              size="icon" 
              onClick={handleCopy}
            >
              {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        )}
        
        <AlertDialogFooter>
          <AlertDialogCancel>Close</AlertDialogCancel>
          <AlertDialogAction>OK</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/**
 * @typedef {Object} CanvasDesign
 * @property {string} id
 * @property {string} customerId
 * @property {string} title
 * @property {any} [elements]
 * @property {any} [lines]
 * @property {any} [images]
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * @param {{ initialDesign?: CanvasDesign | null, token?: string | null, customerId?: string }} props
 */
const DrawingCanvas = ({ initialDesign: initialDesignProp, token, customerId,userEmail,permission  }) => {
  const [elements, setElements] = useState(initialDesignProp?.elements || []);
  const [lines, setLines] = useState(initialDesignProp?.lines || []);
  const [images, setImages] = useState([]); // Initialize empty; we'll load images below
  const [tool, setTool] = useState("pen");
  const [brushType, setBrushType] = useState("normal");
  const [selectedId, setSelectedId] = useState(null);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [gradient, setGradient] = useState({ start: "#ff0000", end: "#0000ff", active: false });
  const [color, setColor] = useState("#000000");
  const [fillColor, setFillColor] = useState("transparent");
  const [strokeWidth, setStrokeWidth] = useState(5);
  const [opacity, setOpacity] = useState(1);
  const [bgColor, setBgColor] = useState("transparent");
  const [isDrawing, setIsDrawing] = useState(false);
  const [textInput, setTextInput] = useState("Double-click to edit");
  const [emails, setEmails] = useState(["", "", ""]);
  const [initialDesign, setInitialDesign] = useState(initialDesignProp || null);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [designShareLink, setDesignShareLink] = useState('');
  const { toast } = useToast();

  const stageRef = useRef(null);
  const transformerRef = useRef(null);
  const fileInputRef = useRef(null);
  const router = useRouter();

  

  // Load images from initialDesignProp by converting src to HTMLImageElement
  useEffect(() => {
    if (initialDesignProp) {
      setElements(initialDesignProp.elements || []);
      setLines(initialDesignProp.lines || []);
      setInitialDesign(initialDesignProp);
  
      // Load background color and gradient from metadata
      if (initialDesignProp.metadata) {
        const metadata = initialDesignProp.metadata;
        if (metadata.bgColor) {
          setBgColor(metadata.bgColor);
        }
        if (metadata.gradient) {
          setGradient(metadata.gradient);
        }
      }
  
      // Handle images
      if (initialDesignProp.images && Array.isArray(initialDesignProp.images)) {
        const loadImages = async () => {
          const loadedImages = await Promise.all(
            initialDesignProp.images.map(async (imgData) => {
              const img = new window.Image();
              img.src = imgData.src;
              await new Promise((resolve) => (img.onload = resolve));
              return {
                ...imgData,
                image: img,
              };
            })
          );
          setImages(loadedImages);
        };
        loadImages();
      }
    }
  }, [initialDesignProp]);

  const handleCreateDesign = async () => {
    const designData = {
      elements,
      lines,
      images: images.map((img) => ({
        ...img,
        src: img.image.src, // Store the src for saving to DB
        image: undefined,   // Remove the HTMLImageElement before saving
      })),
    };
    if (!customerId) {
      alert("Please log in to save a design.");
      return;
    }
    const title = "My Canvas Design";

    const response = await fetch("/api/canvas/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customerId, title, ...designData }),
    });

    const data = await response.json();
    if (data.id) {
      setInitialDesign(data);
      setDesignShareLink(`/design/${data.id}`); // Example link format
      setSuccessDialogOpen(true);
    } else {
      alert("Failed to create canvas design.");
    }
  };

  const handleShare = async () => {
    if (!initialDesign?.id) return;
    const validEmails = emails.filter((email) => email.trim() !== "");
    if (validEmails.length === 0) {
      alert("Please enter at least one email.");
      return;
    }

    const response = await fetch("/api/canvas/share", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ canvasId: initialDesign.id, emails: validEmails }),
    });

    const data = await response.json();
    if (data.links) {
     // Open success dialog with share links
     setDesignShareLink(data.links[0]); // Use first link as example
     setSuccessDialogOpen(true);
    } else {
      alert("Failed to generate share links.");
    }
  };

  const handleSave = async () => {
    if (!token || !userEmail) {
      console.error("Token or userEmail is missing");
      alert("Unable to save - missing authentication information");
      return;
    }
    const designData = {
      elements: elements.map(element => {
        // Preserve all properties, including gradient details
        if (element.type === 'rectangle' || element.type === 'circle') {
          return {
            ...element,
            // Ensure gradient colors are saved
            gradientStart: element.gradientStart,
            gradientEnd: element.gradientEnd,
            fill: element.fill
          };
        }
        return element;
      }),
      lines: lines,
      images: images.map((img) => ({
        ...img,
        src: img.image.src, // Store the src for saving to DB
        image: undefined,   // Remove the HTMLImageElement before saving
      })),
      // Add background color to the save payload
      bgColor: bgColor,
      // Include gradient settings
      gradient: {
        start: gradient.start,
        end: gradient.end,
        active: gradient.active
      }
    };
  
    try {
      const response = await fetch("/api/canvas/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, designData, userEmail }),
      });
  
      if (response.ok) {
        toast({
          title: "Success",
          description: "Canvas design saved successfully!",
        });
      } else {
        const errorData = await response.json();
        alert(`Failed to save canvas design: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Save error:", error);
      alert("Failed to save canvas design. Please try again.");
    }
  };

  // Initialize history with empty state
  useEffect(() => {
    if (history.length === 0) {
      updateHistory([]);
    }
  }, []);

  // Update transformer when selection changes
  useEffect(() => {
    if (selectedId && transformerRef.current) {
      const selectedNode = elements.find(el => el.id === selectedId) || 
                           images.find(img => img.id === selectedId);
      
      if (selectedNode) {
        // Find the corresponding Konva node
        const stage = stageRef.current;
        const node = stage.findOne(`#${selectedId}`);
        
        if (node) {
          transformerRef.current.nodes([node]);
          transformerRef.current.getLayer().batchDraw();
        }
      }
    } else if (transformerRef.current) {
      transformerRef.current.nodes([]);
      transformerRef.current.getLayer().batchDraw();
    }
  }, [selectedId, elements, images]);

  // Handle history updates
  const updateHistory = (newElements) => {
    // Create a snapshot of the current state
    const snapshot = {
      elements: [...newElements],
      lines: [...lines],
      images: [...images]
    };
    
    // If we made changes after undoing, remove the future states
    const newHistory = [...history.slice(0, historyIndex + 1), snapshot];
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      setElements(prevState.elements);
      setLines(prevState.lines);
      setImages(prevState.images);
      setHistoryIndex(historyIndex - 1);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setElements(nextState.elements);
      setLines(nextState.lines);
      setImages(nextState.images);
      setHistoryIndex(historyIndex + 1);
    }
  };

  const handleClear = () => {
    setElements([]);
    setLines([]);
    setImages([]);
    updateHistory([]);
  };

  // Create SprayCan brush points
  const createSprayPoints = (x, y, density = 20, radius = strokeWidth * 2) => {
    const points = [];
    for (let i = 0; i < density; i++) {
      // Create random points within a circle
      const angle = Math.random() * Math.PI * 2;
      const randomRadius = Math.random() * radius;
      const pX = x + Math.cos(angle) * randomRadius;
      const pY = y + Math.sin(angle) * randomRadius;
      points.push(pX, pY);
    }
    return points;
  };

  // Create brush stroke based on brush type
  const getBrushPoints = (points, type) => {
    switch (type) {
      case "rough":
        // Add slight randomness to points for a rough look
        const roughPoints = [];
        for (let i = 0; i < points.length; i += 2) {
          const jitter = Math.random() * 3 - 1.5;
          roughPoints.push(points[i] + jitter);
          roughPoints.push(points[i + 1] + jitter);
        }
        return roughPoints;
      
      case "calligraphy":
        // This simulates calligraphy by creating thicker vertical strokes
        return points;
      
      case "spray":
        // Handled differently - each point creates a spray pattern
        return points;
      
      default:
        return points;
    }
  };

  // Get line properties based on brush type
  const getBrushProperties = (type) => {
    switch (type) {
      case "rough":
        return {
          tension: 0.2,
          lineCap: "round",
          lineJoin: "round"
        };
      
      case "calligraphy":
        return {
          tension: 0.5,
          lineCap: "square",
          lineJoin: "bevel",
          dash: [0, 0]
        };
      
      case "spray":
        return {
          tension: 0,
          lineCap: "round",
          lineJoin: "round",
          closed: false
        };
      
      case "normal":
      default:
        return {
          tension: 0.5,
          lineCap: "round",
          lineJoin: "round"
        };
    }
  };

  // Handle drawing
  const handleMouseDown = (e) => {
    // Stop drawing if right mouse button is clicked
    if (e.evt.button === 2) return; 
    
    setIsDrawing(true);
    const pos = e.target.getStage().getPointerPosition();
    
    if (tool === "remove") {
      // Remove specific elements at click position
      const stage = stageRef.current;
      const shapes = stage.getAllIntersections(pos);
      
      if (shapes.length > 0) {
        // Find element ids to remove
        const idsToRemove = shapes.map(shape => shape.id());
        
        setElements(prev => prev.filter(el => !idsToRemove.includes(el.id)));
        setLines(prev => prev.filter(line => !idsToRemove.includes(line.id)));
        setImages(prev => prev.filter(img => !idsToRemove.includes(img.id)));
        
        updateHistory([
          ...elements.filter(el => !idsToRemove.includes(el.id)), 
          ...lines.filter(line => !idsToRemove.includes(line.id))
        ]);
      }
      return;
    }
    
    if (tool === "eraser") {
      // Create an eraser line
      const id = uuidv4();
      setLines([...lines, { 
        id, 
        points: [pos.x, pos.y], 
        stroke: "black", // Use any color (it won't be visible)
        strokeWidth: strokeWidth * 2,
        brushType: "normal",
        opacity: 1,
        globalCompositeOperation: "destination-out",
        ...getBrushProperties("normal")
      }]);
      setSelectedId(null);
      return;
    }
    
    if (tool === "select") {
      // Deselect when clicked on empty area
      const clickedOnEmpty = e.target === e.target.getStage();
      if (clickedOnEmpty) {
        setSelectedId(null);
      }
      return;
    }
    
    if (["pen", "rough", "calligraphy"].includes(tool)) {
      const id = uuidv4();
      const currentBrushType = tool !== "pen" ? tool : brushType;
      
      setLines([...lines, { 
        id, 
        points: [pos.x, pos.y], 
        stroke: color, 
        strokeWidth: tool === "calligraphy" ? strokeWidth * 2 : strokeWidth,
        opacity,
        brushType: currentBrushType,
        ...getBrushProperties(currentBrushType)
      }]);
      setSelectedId(null);
      return;
    }
    
    if (tool === "spray") {
      // For spray, we create multiple tiny circles instead of a single line
      const sprayPoints = createSprayPoints(pos.x, pos.y);
      
      // Create individual dots for each spray point
      for (let i = 0; i < sprayPoints.length; i += 2) {
        const id = uuidv4();
        setElements(prev => [...prev, {
          id,
          type: "circle", // Use circle shapes for dots
          x: sprayPoints[i],
          y: sprayPoints[i + 1],
          radius: strokeWidth / 4, // Small radius for dots
          fill: color, // Fill with the color (no stroke)
          stroke: null,
          strokeWidth: 0,
          opacity
        }]);
      }
      
      setSelectedId(null);
      return;
    }
    
    if (tool === "rectangle") {
      const id = uuidv4();
      const newRect = {
        id,
        type: "rectangle",
        x: pos.x,
        y: pos.y,
        width: 0,
        height: 0,
        stroke: color,
        strokeWidth,
        opacity,
        fill: fillColor === "transparent" ? 
              (gradient.active ? 'gradient' : 'transparent') : fillColor,
        gradientStart: gradient.start,
        gradientEnd: gradient.end
      };
      
      setElements([...elements, newRect]);
      setSelectedId(newRect.id);
      return;
    }
    
    if (tool === "circle") {
      const id = uuidv4();
      const newCircle = {
        id,
        type: "circle",
        x: pos.x,
        y: pos.y,
        radius: 0,
        stroke: color,
        strokeWidth,
        opacity,
        fill: fillColor === "transparent" ? 
              (gradient.active ? 'gradient' : 'transparent') : fillColor,
        gradientStart: gradient.start,
        gradientEnd: gradient.end
      };
      
      setElements([...elements, newCircle]);
      setSelectedId(newCircle.id);
      return;
    }

    
    
    if (tool === "text") {
      const id = uuidv4();
      const newText = {
        id,
        type: "text",
        x: pos.x,
        y: pos.y,
        text: textInput,
        fontSize: 20,
        opacity,
        fill: color
      };
      
      setElements([...elements, newText]);
      setSelectedId(newText.id);
      return;
    }
  };

  const handleMouseMove = (e) => {
    if (!stageRef.current || !isDrawing) return;
    
    const stage = stageRef.current;
    const point = stage.getPointerPosition();
    
    if (["pen", "rough", "calligraphy", "eraser"].includes(tool) && lines.length) {
      const lastLine = lines[lines.length - 1];
      
      // Add point to the last line
      let newPoints;
      if (tool === "rough" || lastLine.brushType === "rough") {
        newPoints = getBrushPoints([...lastLine.points, point.x, point.y], "rough");
      } else {
        newPoints = [...lastLine.points, point.x, point.y];
      }
      
      const updatedLines = [...lines];
      updatedLines[lines.length - 1].points = newPoints;
      
      setLines(updatedLines);
    } else if (tool === "spray") {
      // For spray, create new dots with each mouse move
      const sprayPoints = createSprayPoints(point.x, point.y);
      
      // Create individual dots for spray
      for (let i = 0; i < sprayPoints.length; i += 2) {
        const id = uuidv4();
        setElements(prev => [...prev, {
          id,
          type: "circle", // Use circle shapes for dots
          x: sprayPoints[i],
          y: sprayPoints[i + 1],
          radius: strokeWidth / 4, // Small radius for dots
          fill: color, // Fill with the color (no stroke)
          stroke: null,
          strokeWidth: 0,
          opacity
        }]);
      }
    } else if (tool === "rectangle" && selectedId) {
      // Update rectangle size as user drags
      const index = elements.findIndex(el => el.id === selectedId);
      if (index >= 0 && elements[index].type === "rectangle") {
        const rect = { ...elements[index] };
        rect.width = point.x - rect.x;
        rect.height = point.y - rect.y;
        
        const newElements = [...elements];
        newElements[index] = rect;
        setElements(newElements);
      }
    } else if (tool === "circle" && selectedId) {
      // Update circle radius as user drags
      const index = elements.findIndex(el => el.id === selectedId);
      if (index >= 0 && elements[index].type === "circle") {
        const circle = { ...elements[index] };
        // Calculate radius based on distance from center to current point
        const dx = point.x - circle.x;
        const dy = point.y - circle.y;
        circle.radius = Math.sqrt(dx * dx + dy * dy);
        
        const newElements = [...elements];
        newElements[index] = circle;
        setElements(newElements);
      }
    }
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    
    if (["pen", "rough", "calligraphy", "eraser", "spray"].includes(tool) && lines.length) {
      updateHistory([...elements, ...lines]);
    } else if ((tool === "rectangle" || tool === "circle") && selectedId) {
      updateHistory([...elements]);
    }
  };

  // Handle mouse leave to stop drawing when cursor leaves canvas
  const handleMouseLeave = () => {
    setIsDrawing(false);
    
    if (["pen", "rough", "calligraphy", "eraser", "spray"].includes(tool) && lines.length) {
      updateHistory([...elements, ...lines]);
    } else if ((tool === "rectangle" || tool === "circle") && selectedId) {
      updateHistory([...elements]);
    }
  };

  // Handle text editing by double-click
  const handleTextDblClick = (e) => {
    const id = e.target.id();
    if (!id) return;
  
    const textNode = e.target;
    const stage = stageRef.current;
    const stageBox = stage.container().getBoundingClientRect(); // Get canvas position
    const textPosition = textNode.getAbsolutePosition(); // Get text position on canvas
  
    // Create textarea
    const textarea = document.createElement("textarea");
    document.body.appendChild(textarea);
  
    // Apply text styles
    textarea.value = textNode.text();
    textarea.style.position = "absolute";
    textarea.style.top = `${stageBox.top + textPosition.y-25}px`; // Position correctly
    textarea.style.left = `${stageBox.left + textPosition.x}px`;
    textarea.style.width = `${textNode.width()}px`;
    textarea.style.height = `${textNode.height()}px`;
    textarea.style.fontSize = `${textNode.fontSize()}px`;
    textarea.style.border = "1px solid black";
    textarea.style.padding = "0px";
    textarea.style.margin = "0px";
    textarea.style.overflow = "hidden";
    textarea.style.background = "none";
    textarea.style.outline = "none";
    textarea.style.resize = "none";
    textarea.style.fontFamily = "Arial";
    textarea.style.color = textNode.fill(); // Use Konva text color
  
    textarea.focus();
  
    // Handle Enter key to save text
    textarea.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        textarea.blur();
      }
    });
  
    // Save and update text after editing
    textarea.addEventListener("blur", () => {
      const newText = textarea.value;
      document.body.removeChild(textarea);
  
      const updatedElements = elements.map(el => 
        el.id === id ? { ...el, text: newText } : el
      );
  
      setElements(updatedElements);
      updateHistory(updatedElements);
    });
  };
  

  // Handle transform end (resize/rotate) and update state
  const handleTransformEnd = () => {
    const node = transformerRef.current?.nodes()[0];
    if (!node) return;
    
    const id = node.id();
    
    // Check if it's an image or another element
    if (images.some(img => img.id === id)) {
      const newImages = images.map(img => {
        if (img.id === id) {
          return {
            ...img,
            x: node.x(),
            y: node.y(),
            width: node.width() * node.scaleX(),
            height: node.height() * node.scaleY(),
            rotation: node.rotation()
          };
        }
        return img;
      });
      
      setImages(newImages);
      updateHistory([...elements]);
    } else {
      const newElements = elements.map(el => {
        if (el.id === id) {
          if (el.type === "rectangle") {
            return {
              ...el,
              x: node.x(),
              y: node.y(),
              width: node.width() * node.scaleX(),
              height: node.height() * node.scaleY(),
              rotation: node.rotation()
            };
          } else if (el.type === "circle") {
            return {
              ...el,
              x: node.x(),
              y: node.y(),
              radius: el.radius * node.scaleX(),
              rotation: node.rotation()
            };
          } else if (el.type === "text") {
            return {
              ...el,
              x: node.x(),
              y: node.y(),
              fontSize: el.fontSize * node.scaleX(),
              rotation: node.rotation()
            };
          }
        }
        return el;
      });
      
      setElements(newElements);
      updateHistory(newElements);
    }
    
    // Reset scale after updating dimensions
    if (node) {
      node.scaleX(1);
      node.scaleY(1);
    }
  };

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const img = new window.Image();
      img.src = reader.result;

      img.onload = () => {
        const size = Math.min(300, Math.max(img.width, img.height));
        const newImage = {
          id: uuidv4(),
          type: "image",
          x: 50,
          y: 50,
          width: size,
          height: size,
          image: img, // Store the HTMLImageElement
          src: reader.result, // Store the data URL for saving
          opacity,
          rotation: 0,
        };

        setImages([...images, newImage]);
        updateHistory([...elements]);
      };
    };

    reader.readAsDataURL(file);
    e.target.value = "";
  };
  
  // Handle export as PNG
  const handleExport = (productType) => {
    if (!productType) {
      console.error("No product type selected!");
      return;
    }
  
    const stage = stageRef.current;
    const dataURL = stage.toDataURL({ pixelRatio: 1, mimeType: "image/png" });
  
    if (!dataURL.startsWith("data:image/png")) {
      console.error("Invalid image data");
      return;
    }
  
    fetch(dataURL)
      .then((res) => res.blob())
      .then((blob) => {
        if (blob.size === 0) {
          console.error("Exported image is empty");
          return;
        }
  
        const file = new File([blob], "design.png", { type: "image/png" });
  
        // Store in sessionStorage for upload page
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          sessionStorage.setItem("exportedImage", reader.result);
  
          const uploadPage = productType === "tshirt"
            ? "/design/upload/tshirt"
            : productType === "phonecase"
            ? "/configure/Phone_Case/upload"
            : "/design/upload/mug";
  
          router.push(uploadPage);
        };
      })
      .catch((err) => console.error("Error exporting image:", err));
  };
  

  // Prevent right-click context menu on canvas for clean drawing experience
  const handleContextMenu = (e) => {
    e.evt.preventDefault();
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <DesignSuccessDialog 
        isOpen={successDialogOpen}
        onClose={() => setSuccessDialogOpen(false)}
        designLink={designShareLink}
        successMessage="Your design has been created and is ready to share!"
      />
      <Tabs defaultValue="tools" className="w-full pb-10">
        <div className="bg-white border-b shadow-sm p-1">
          <TabsList className="grid grid-cols-4 w-full md:w-auto md:flex md:gap-2">
            <TabsTrigger value="tools">Tools</TabsTrigger>
            <TabsTrigger value="colors">Colors</TabsTrigger>
            <TabsTrigger value="text">Text</TabsTrigger>
            <TabsTrigger value="actions">Actions</TabsTrigger>
            <TabsTrigger value="share">Share</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="tools" className="p-2 bg-white border-b shadow-sm flex flex-wrap gap-2">
          <ToggleGroup type="single" value={tool} onValueChange={(value) => value && setTool(value)}>
            <ToggleGroupItem value="pen" aria-label="Pen">
              <Pencil className="h-5 w-5" />
            </ToggleGroupItem>
            <ToggleGroupItem value="rough" aria-label="Rough Brush">
              <Pencil className="h-5 w-5" />
              <span className="text-xs">Rough</span>
            </ToggleGroupItem>
            <ToggleGroupItem value="calligraphy" aria-label="Calligraphy">
              <Pencil className="h-5 w-5" />
              <span className="text-xs">Calli</span>
            </ToggleGroupItem>
            <ToggleGroupItem value="spray" aria-label="Spray">
              <SprayCan className="h-5 w-5" />
            </ToggleGroupItem>
            <ToggleGroupItem value="rectangle" aria-label="Rectangle">
              <Square className="h-5 w-5" />
            </ToggleGroupItem>
            <ToggleGroupItem value="circle" aria-label="Circle">
              <CircleIcon className="h-5 w-5" />
            </ToggleGroupItem>
            <ToggleGroupItem value="text" aria-label="Text">
              <Type className="h-5 w-5" />
            </ToggleGroupItem>
            <ToggleGroupItem value="eraser" aria-label="Eraser">
              <Eraser className="h-5 w-5" />
            </ToggleGroupItem>
            <ToggleGroupItem value="remove" aria-label="Remove Element">
              <XCircle className="h-5 w-5" />
            </ToggleGroupItem>
            <ToggleGroupItem value="select" aria-label="Select">
              <Move className="h-5 w-5" />
            </ToggleGroupItem>
          </ToggleGroup>
          
          <div className="flex items-center gap-2 ml-2">
            <Label htmlFor="stroke-width">Width</Label>
            <Slider 
              id="stroke-width"
              min={1} 
              max={20} 
              step={1} 
              value={[strokeWidth]} 
              onValueChange={(values) => setStrokeWidth(values[0])}
              className="w-32"
            />
            <span className="text-sm font-medium">{strokeWidth}px</span>
          </div>
          
          <div className="flex items-center gap-2 ml-2">
            <Label htmlFor="opacity">Opacity</Label>
            <Slider 
              id="opacity"
              min={0.1} 
              max={1} 
              step={0.1} 
              value={[opacity]} 
              onValueChange={(values) => setOpacity(values[0])}
              className="w-32"
            />
            <span className="text-sm font-medium">{Math.round(opacity * 100)}%</span>
          </div>
        </TabsContent>
        
        <TabsContent value="colors" className="p-2 bg-white border-b shadow-sm">
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Label htmlFor="stroke-color">Stroke</Label>
              <div className="flex items-center border rounded overflow-hidden">
                <div className="w-8 h-8" style={{ backgroundColor: color }}></div>
                <Input 
                  id="stroke-color"
                  type="color" 
                  value={color} 
                  onChange={(e) => setColor(e.target.value)} 
                  className="w-10 h-8 p-0 border-0"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Label htmlFor="fill-color">Fill</Label>
              <div className="flex items-center border rounded overflow-hidden">
                <div 
                  className="w-8 h-8" 
                  style={{ 
                    backgroundColor: fillColor === "transparent" ? "#ffffff" : fillColor,
                    backgroundImage: fillColor === "transparent" ? "linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc), linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc)" : "none",
                    backgroundSize: "8px 8px",
                    backgroundPosition: "0 0, 4px 4px"
                  }}
                ></div>
                <Input 
                  id="fill-color"
                  type="color" 
                  value={fillColor === "transparent" ? "#ffffff" : fillColor} 
                  onChange={(e) => setFillColor(e.target.value)} 
                  className="w-10 h-8 p-0 border-0"
                />
              </div>
              <Button 
                variant={fillColor === "transparent" ? "outline" : "default"}
                className='px-4 sm:px-6 lg:px-8'
                onClick={() => setFillColor(fillColor === "transparent" ? "#ffffff" : "transparent")}
              >
                {fillColor === "transparent" ? "Enable Fill" : "Disable Fill"}
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              <Label htmlFor="bg-color">Background</Label>
              <div className="flex items-center border rounded overflow-hidden">
                <div className="w-8 h-8" style={{ backgroundColor: bgColor }}></div>
                <Input 
                  id="bg-color"
                  type="color" 
                  value={bgColor} 
                  onChange={(e) => setBgColor(e.target.value)} 
                  className="w-10 h-8 p-0 border-0"
                />
              </div>
            </div>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Palette size={16} />
                  Gradient {gradient.active ? "(On)" : "(Off)"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="gradient-start">Start</Label>
                    <Input 
                      id="gradient-start"
                      type="color" 
                      value={gradient.start} 
                      onChange={(e) => setGradient(prev => ({...prev, start: e.target.value}))}
                      className="w-16 h-8"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="gradient-end">End</Label>
                    <Input 
                      id="gradient-end"
                      type="color" 
                      value={gradient.end} 
                      onChange={(e) => setGradient(prev => ({...prev, end: e.target.value}))}
                      className="w-16 h-8"
                    />
                  </div>
                  <Button
                    onClick={() => setGradient(prev => ({...prev, active: !prev.active}))}
                    className="w-full"
                  >
                    {gradient.active ? "Disable Gradient" : "Enable Gradient"}
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </TabsContent>
        
        <TabsContent value="text" className="p-2 bg-white border-b shadow-sm">
          <div className="flex items-center gap-2">
            <Label htmlFor="text-input">Text Content</Label>
            <Input 
              id="text-input"
              type="text" 
              value={textInput} 
              onChange={(e) => setTextInput(e.target.value)} 
              placeholder="Text to add" 
              className="w-64"
            />
            <Button 
              onClick={() => setTool("text")} 
              variant={tool === "text" ? "default" : "outline"}
              className='px-4 sm:px-6 lg:px-8'
            >
              <Type className="h-4 w-4 mr-1" />
              Add Text
            </Button>
          </div>
          <div className="mt-2 text-sm text-gray-500">
            Double-click on existing text to edit it directly on the canvas
          </div>
        </TabsContent>
        
        <TabsContent value="actions" className="p-2 bg-white border-b shadow-sm">
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleUndo} disabled={historyIndex <= 0} variant="outline" className='px-4 sm:px-6 lg:px-8'>
              <Undo2 className="h-4 w-4 mr-1" />
              Undo
            </Button>
            <Button onClick={handleRedo} disabled={historyIndex >= history.length - 1} variant="outline" className='px-4 sm:px-6 lg:px-8'>
              <Redo2 className="h-4 w-4 mr-1" />
              Redo
            </Button>
            <Button onClick={handleClear} variant="outline" className='px-4 sm:px-6 lg:px-8'>
              <Trash2 className="h-4 w-4 mr-1" />
              Clear
            </Button>
            <Button onClick={() => fileInputRef.current.click()} variant="outline" className='px-4 sm:px-6 lg:px-8'>
              <Upload className="h-4 w-4 mr-1" />
              Upload
            </Button>
            
            <Button onClick={handleCreateDesign} variant="outline" className='px-4 sm:px-6 lg:px-8'>
              Save New Design
            </Button>

            {token && (
        
          <Button onClick={handleSave} variant="outline">
            Save Changes
          </Button>
        
      )}
  
            <input 
              type="file" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              accept="image/*" 
              onChange={handleImageUpload}
            />
<div className="relative">
  {/* Export Button */}
  <Button onClick={() => setShowExportOptions(!showExportOptions)} variant="outline" className='px-4 sm:px-6 lg:px-8'>
    <Download className="h-4 w-4 mr-1" /> Export
  </Button>

  {/* Dropdown Menu */}
  {showExportOptions && (
    <div className="absolute top-full mt-2 w-48 bg-white shadow-lg rounded-lg border border-gray-200 z-50">
      <div className="p-2">
        <p className="text-sm font-semibold mb-2">Select Product:</p>
        <button onClick={() => handleExport("tshirt")} className="block w-full text-left px-4 py-2 hover:bg-gray-100">
        <Shirt className='h-5 w-5 text-blue-500' /> T-Shirt
        </button>
        <button onClick={() => handleExport("phonecase")} className="block w-full text-left px-4 py-2 hover:bg-gray-100">
        <Smartphone className='h-5 w-5 text-green-500' /> Phone Case
        </button>
        <button onClick={() => handleExport("mug")} className="block w-full text-left px-4 py-2 hover:bg-gray-100">
        <Coffee className='h-5 w-5 text-orange-500' /> Mug
        </button>
      </div>
    </div>
  )}
</div>


          </div>
        </TabsContent>

        <TabsContent value="share" className="p-2 bg-white border-b shadow-sm">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Share with (up to 3 emails):</Label>
              {emails.map((email, index) => (
                <Input
                  key={index}
                  type="email"
                  value={email}
                  onChange={(e) => {
                    const newEmails = [...emails];
                    newEmails[index] = e.target.value;
                    setEmails(newEmails);
                  }}
                  placeholder={`Email ${index + 1}`}
                  className="w-64"
                />
              ))}
            </div>
            <Button onClick={handleShare} disabled={!initialDesign}>
              Generate Share Links
            </Button>
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="flex-1 flex justify-center items-center p-4 overflow-auto">
        <Card className="shadow-lg">
          <CardContent className="p-0">
            <Stage
              width={800}
              height={500}
              ref={stageRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
              onContextMenu={handleContextMenu}
              style={{ backgroundColor: bgColor, pointerEvents: showExportOptions ? "none" : "auto" }}
            >
              <Layer>
                {bgColor !== "transparent" && (
                  <Rect x={0} y={0} width={800} height={600} fill={bgColor} />
                )}
                {lines.map((line) => (
                  <Line
                    key={line.id}
                    id={line.id}
                    points={line.points}
                    stroke={line.stroke}
                    strokeWidth={line.strokeWidth}
                    lineCap={line.lineCap}
                    lineJoin={line.lineJoin}
                    tension={line.tension}
                    opacity={line.opacity}
                    globalCompositeOperation={line.globalCompositeOperation || "source-over"}
                  />
                ))}
                {elements.map((element) => {
                  if (element.type === "rectangle") {
                    if (element.fill === "gradient" && gradient.active) {
                      return (
                        <Rect
                          key={element.id}
                          id={element.id}
                          x={element.x}
                          y={element.y}
                          width={element.width}
                          height={element.height}
                          stroke={element.stroke}
                          strokeWidth={element.strokeWidth}
                          fillLinearGradientStartPoint={{ x: 0, y: 0 }}
                          fillLinearGradientEndPoint={{ x: element.width, y: element.height }}
                          fillLinearGradientColorStops={[0, element.gradientStart, 1, element.gradientEnd]}
                          opacity={element.opacity}
                          rotation={element.rotation || 0}
                          draggable={tool === "select"}
                          onClick={(e) => tool === "select" && setSelectedId(element.id)}
                        />
                      );
                    }
                    return (
                      <Rect
                        key={element.id}
                        id={element.id}
                        x={element.x}
                        y={element.y}
                        width={element.width}
                        height={element.height}
                        stroke={element.stroke}
                        strokeWidth={element.strokeWidth}
                        fill={element.fill}
                        opacity={element.opacity}
                        rotation={element.rotation || 0}
                        draggable={tool === "select"}
                        onClick={(e) => tool === "select" && setSelectedId(element.id)}
                      />
                    );
                  } else if (element.type === "circle") {
                    if (element.fill === "gradient" && gradient.active) {
                      return (
                        <Circle
                          key={element.id}
                          id={element.id}
                          x={element.x}
                          y={element.y}
                          radius={element.radius}
                          stroke={element.stroke}
                          strokeWidth={element.strokeWidth}
                          fillRadialGradientStartPoint={{ x: 0, y: 0 }}
                          fillRadialGradientStartRadius={0}
                          fillRadialGradientEndPoint={{ x: 0, y: 0 }}
                          fillRadialGradientEndRadius={element.radius}
                          fillRadialGradientColorStops={[0, element.gradientStart, 1, element.gradientEnd]}
                          opacity={element.opacity}
                          rotation={element.rotation || 0}
                          draggable={tool === "select"}
                          onClick={(e) => tool === "select" && setSelectedId(element.id)}
                        />
                      );
                    }
                    return (
                      <Circle
                        key={element.id}
                        id={element.id}
                        x={element.x}
                        y={element.y}
                        radius={element.radius}
                        stroke={element.stroke}
                        strokeWidth={element.strokeWidth}
                        fill={element.fill}
                        opacity={element.opacity}
                        rotation={element.rotation || 0}
                        draggable={tool === "select"}
                        onClick={(e) => tool === "select" && setSelectedId(element.id)}
                      />
                    );
                  } else if (element.type === "text") {
                    return (
                      <Text
                        key={element.id}
                        id={element.id}
                        x={element.x}
                        y={element.y}
                        text={element.text}
                        fontSize={element.fontSize}
                        fill={element.fill}
                        opacity={element.opacity}
                        rotation={element.rotation || 0}
                        draggable={tool === "select"}
                        onClick={(e) => tool === "select" && setSelectedId(element.id)}
                        onDblClick={handleTextDblClick}
                      />
                    );
                  }
                  return null;
                })}
                {images.map((img) => (
                  <Image
                    key={img.id}
                    id={img.id}
                    x={img.x}
                    y={img.y}
                    width={img.width}
                    height={img.height}
                    image={img.image} // Use the HTMLImageElement
                    opacity={img.opacity}
                    rotation={img.rotation || 0}
                    draggable={tool === "select"}
                    onClick={(e) => tool === "select" && setSelectedId(img.id)}
                  />
                ))}
                <Transformer
                  ref={transformerRef}
                  boundBoxFunc={(oldBox, newBox) => {
                    if (newBox.width < 5 || newBox.height < 5) {
                      return oldBox;
                    }
                    return newBox;
                  }}
                  onTransformEnd={handleTransformEnd}
                />
              </Layer>
            </Stage>
          </CardContent>
        </Card>
      </div>
      
    </div>
  );
};

export default DrawingCanvas;