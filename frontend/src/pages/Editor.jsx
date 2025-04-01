import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { fabric } from 'fabric';
import * as pdfjsLib from 'pdfjs-dist';
import api from '../services/api';
import { PDFDocument, rgb } from 'pdf-lib';

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const Editor = () => {
  const { templateId } = useParams();
  const [template, setTemplate] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditorReady, setIsEditorReady] = useState(false);
  const canvasRef = useRef(null);
  const fabricCanvasRef = useRef(null);
  const navigate = useNavigate();
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [pdfUrl, setPdfUrl] = useState(null);
  const [hasError, setHasError] = useState(false);

  // Initialize fabric in useEffect
  useEffect(() => {
    fetchTemplate();

    return () => {
      // Cleanup
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.dispose();
        fabricCanvasRef.current = null;
      }
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, []);

  // Add resize handler
  useEffect(() => {
    const handleResize = () => {
      if (fabricCanvasRef.current) {
        const width = window.innerWidth - (window.innerWidth > 768 ? 350 : 32); // Less padding on mobile
        const height = window.innerHeight - 250;
        fabricCanvasRef.current.setDimensions({ width, height });
        setCanvasSize({ width, height });
        fabricCanvasRef.current.renderAll();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Add keyboard event listener in useEffect
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const fetchTemplate = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/templates/${templateId}`,
        { credentials: 'include' }
      );

      if (response.status === 403) {
        toast.error('You need a premium subscription to edit this template');
        navigate('/pricing');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch template');
      }

      const data = await response.json();
      setTemplate(data.data);

      // If it's an original template and not a copy, create a copy first
      if (data.type === 'original') {
        const copyResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/api/templates/${templateId}/copy`,
          {
            method: 'POST',
            credentials: 'include'
          }
        );

        if (!copyResponse.ok) {
          throw new Error('Failed to create template copy');
        }

        const copyData = await copyResponse.json();
        navigate(`/editor/${copyData.data.id}`, { replace: true });
        return;
      }

      // Initialize PDF editor after a short delay to ensure DOM is ready
      setTimeout(() => {
        initializeEditor(data.data.file_path);
      }, 100);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load template');
      navigate('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  // Add missing event handlers
  const enforceCanvasBounds = (e) => {
    const obj = e.target;
    const canvas = fabricCanvasRef.current;

    // Calculate bounds
    const objWidth = obj.getScaledWidth();
    const objHeight = obj.getScaledHeight();

    // Enforce left/right bounds
    if (obj.left < 0) obj.left = 0;
    if (obj.left + objWidth > canvas.width) {
      obj.left = canvas.width - objWidth;
    }

    // Enforce top/bottom bounds
    if (obj.top < 0) obj.top = 0;
    if (obj.top + objHeight > canvas.height) {
      obj.top = canvas.height - objHeight;
    }
  };

  const onObjectSelected = () => {
    // Handle object selection if needed
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.renderAll();
    }
  };

  // Update initializeEditor function
  const initializeEditor = async (filePath) => {
    try {
      const fileUrl = `${import.meta.env.VITE_API_URL}${filePath.startsWith('/') ? '' : '/'}${filePath}`;
      console.log('Loading PDF from:', fileUrl);

      const pdfResponse = await fetch(fileUrl, {
        credentials: 'include',
        headers: {
          'Accept': 'application/pdf'
        }
      });

      if (!pdfResponse.ok) {
        throw new Error(`Failed to fetch PDF: ${pdfResponse.statusText}`);
      }

      const pdfArrayBuffer = await pdfResponse.arrayBuffer();
      const pdfBlob = new Blob([pdfArrayBuffer], { type: 'application/pdf' });
      const pdfObjectUrl = URL.createObjectURL(pdfBlob);
      setPdfUrl(pdfObjectUrl);

      // Set canvas size to match A4 dimensions
      const containerWidth = window.innerWidth - (window.innerWidth > 768 ? 350 : 32);
      const containerHeight = window.innerHeight - 180;

      // A4 dimensions (595.28 x 841.89 points)
      const a4Width = 595.28;
      const a4Height = 841.89;

      // Calculate scale to fit container
      const scaleX = containerWidth / a4Width;
      const scaleY = containerHeight / a4Height;
      const scale = Math.min(scaleX, scaleY) * 0.9; // 90% of container size

      const width = Math.floor(a4Width * scale);
      const height = Math.floor(a4Height * scale);

      setCanvasSize({ width, height });

      // Initialize canvas with the calculated dimensions
      requestAnimationFrame(() => {
        initializeCanvas(width, height, pdfArrayBuffer);
      });
    } catch (error) {
      console.error('Error initializing editor:', error);
      toast.error('Failed to initialize editor');
      setHasError(true);
    }
  };

  // Update the initializeCanvas function
  const initializeCanvas = (width, height, pdfArrayBuffer) => {
    if (!canvasRef.current) return;

    // Cleanup existing canvas if any
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.dispose();
    }

    // Initialize fabric canvas
    fabricCanvasRef.current = new fabric.Canvas(canvasRef.current, {
      width,
      height,
      backgroundColor: '#ffffff',
      selection: true,
      preserveObjectStacking: true
    });

    // Load PDF using PDF.js
    pdfjsLib.getDocument({ data: pdfArrayBuffer }).promise
      .then(async (pdf) => {
        try {
          const page = await pdf.getPage(1);
          const viewport = page.getViewport({ scale: 2.0 });

          const tempCanvas = document.createElement('canvas');
          const context = tempCanvas.getContext('2d');
          tempCanvas.width = viewport.width;
          tempCanvas.height = viewport.height;

          await page.render({
            canvasContext: context,
            viewport: viewport
          }).promise;

          fabric.Image.fromURL(tempCanvas.toDataURL(), (img) => {
            if (!fabricCanvasRef.current) return;

            const scaleX = width / img.width;
            const scaleY = height / img.height;
            const scale = Math.min(scaleX, scaleY);

            img.set({
              scaleX: scale,
              scaleY: scale,
              left: 0,
              top: 0,
              selectable: false,
              evented: false,
              absolutePositioned: true
            });

            fabricCanvasRef.current.setBackgroundImage(img, () => {
              fabricCanvasRef.current.renderAll();

              // Load existing content if available
              if (template?.content) {
                try {
                  const savedContent = JSON.parse(template.content);
                  // Load each object with proper class type
                  fabricCanvasRef.current.loadFromJSON(savedContent, () => {
                    // Ensure all objects have proper event handlers
                    fabricCanvasRef.current.getObjects().forEach(obj => {
                      obj.setControlsVisibility({
                        mt: true,
                        mb: true,
                        ml: true,
                        mr: true,
                        bl: true,
                        br: true,
                        tl: true,
                        tr: true
                      });
                    });
                    fabricCanvasRef.current.renderAll();
                  }, (o, object) => {
                    // Custom reviver to ensure proper object types
                    if (object.type === 'i-text') {
                      return new fabric.IText(object.text, object);
                    }
                  });
                } catch (e) {
                  console.error('Error loading saved content:', e);
                  toast.error('Error loading saved content');
                }
              }
              setIsEditorReady(true);
            });
          });
        } catch (error) {
          console.error('Error rendering PDF:', error);
          toast.error('Failed to render PDF');
        }
      });
  };

  // Add function to update PDF with edits
  const updatePDFWithEdits = async () => {
    if (!fabricCanvasRef.current) return;

    try {
      // Get the canvas data URL with all edits
      const editedCanvasDataUrl = fabricCanvasRef.current.toDataURL({
        format: 'png',
        quality: 1,
        multiplier: 2
      });

      // Update the preview
      if (canvasRef.current) {
        const context = canvasRef.current.getContext('2d');
        const img = new Image();
        img.onload = () => {
          context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          context.drawImage(img, 0, 0, canvasRef.current.width, canvasRef.current.height);
        };
        img.src = editedCanvasDataUrl;
      }
    } catch (error) {
      console.error('Error updating PDF preview:', error);
    }
  };

  // Add keyboard handler for delete
  const handleKeyDown = (e) => {
    if (!fabricCanvasRef.current) return;

    if (e.key === 'Delete' || e.key === 'Backspace') {
      const activeObject = fabricCanvasRef.current.getActiveObject();
      if (activeObject) {
        fabricCanvasRef.current.remove(activeObject);
        fabricCanvasRef.current.renderAll();
      }
    }
  };

  // Update addText function
  const addText = () => {
    if (!fabricCanvasRef.current || !isEditorReady) {
      toast.error('Editor is not ready yet');
      return;
    }

    const text = new fabric.IText('Click to edit', {
      left: fabricCanvasRef.current.width / 2 - 50,
      top: fabricCanvasRef.current.height / 2 - 10,
      fontFamily: 'Arial',
      fontSize: 20,
      fill: '#000000',
      editable: true,
      selectable: true,
      hasControls: true,
      hasBorders: true,
      lockUniScaling: false,
      centeredScaling: true
    });

    fabricCanvasRef.current.add(text);
    fabricCanvasRef.current.setActiveObject(text);
    text.enterEditing();
    text.selectAll();
    fabricCanvasRef.current.renderAll();
  };

  // Update addShape function
  const addShape = (type) => {
    if (!fabricCanvasRef.current || !isEditorReady) {
      toast.error('Editor is not ready yet');
      return;
    }

    let shape;
    if (type === 'rectangle') {
      shape = new fabric.Rect({
        left: fabricCanvasRef.current.width / 2 - 50,
        top: fabricCanvasRef.current.height / 2 - 25,
        width: 100,
        height: 50,
        fill: 'transparent',
        stroke: '#000000',
        strokeWidth: 2,
        selectable: true,
        hasControls: true,
        hasBorders: true
      });
    } else if (type === 'circle') {
      shape = new fabric.Circle({
        left: fabricCanvasRef.current.width / 2 - 30,
        top: fabricCanvasRef.current.height / 2 - 30,
        radius: 30,
        fill: 'transparent',
        stroke: '#000000',
        strokeWidth: 2,
        selectable: true,
        hasControls: true,
        hasBorders: true
      });
    }
    fabricCanvasRef.current.add(shape);
    fabricCanvasRef.current.setActiveObject(shape);
    fabricCanvasRef.current.renderAll();
  };

  // Update handleSave function
  const handleSave = async () => {
    try {
      setIsSaving(true);

      // Get canvas data with all elements
      const canvas = fabricCanvasRef.current;

      // Create a JSON object that includes all necessary properties
      const canvasData = canvas.toJSON(['id', 'selectable', 'hasControls',
        'transparentCorners', 'text', 'fontSize', 'fontFamily', 'fill',
        'stroke', 'strokeWidth', 'width', 'height', 'radius']);

      // Generate preview
      const previewUrl = canvas.toDataURL({
        format: 'jpeg',
        quality: 0.5,
        multiplier: 0.5
      });

      // Create form data
      const formData = new FormData();
      formData.append('templateId', templateId);
      formData.append('content', JSON.stringify(canvasData));
      formData.append('previewUrl', previewUrl);
      formData.append('title', template.title);
      formData.append('description', template.description);

      // Get the modified PDF
      const modifiedPdfBytes = await generateModifiedPDF(canvas);
      formData.append('pdfFile', new Blob([modifiedPdfBytes], { type: 'application/pdf' }), 'modified.pdf');

      const response = await api.post('/templates/update', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        toast.success('Template saved successfully');
      } else {
        throw new Error(response.data.message || 'Failed to save template');
      }
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error(error.message || 'Failed to save template');
    } finally {
      setIsSaving(false);
    }
  };

  // Add helper function to generate modified PDF
  const generateModifiedPDF = async (canvas) => {
    // Get canvas data as PNG
    const dataUrl = canvas.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: 2
    });

    // Convert data URL to Uint8Array
    const base64Data = dataUrl.split(',')[1];
    const imageBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

    // Load the original PDF
    const pdfResponse = await fetch(`${import.meta.env.VITE_API_URL}${template.file_path}`, {
      credentials: 'include'
    });
    const pdfBytes = await pdfResponse.arrayBuffer();

    // Create new PDF with canvas content
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const pngImage = await pdfDoc.embedPng(imageBytes);

    const [firstPage] = pdfDoc.getPages();
    const { width, height } = firstPage.getSize();

    firstPage.drawImage(pngImage, {
      x: 0,
      y: 0,
      width,
      height,
    });

    return pdfDoc.save();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4">Loading editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <div className="p-4 border-b">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl md:text-2xl font-bold">
              Edit Template: {template?.title}
            </h1>
            {template?.original_title && (
              <p className="text-sm text-muted-foreground">
                Based on: {template.original_title}
              </p>
            )}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => navigate('/copied-templates')}
              className="px-3 py-1.5 border rounded-md hover:bg-gray-50 text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || !isEditorReady}
              className="px-3 py-1.5 bg-primary text-white rounded-md hover:bg-primary-dark disabled:opacity-50 text-sm"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        {/* Tools Panel - Collapsible on mobile */}
        <div className="md:w-48 border-b md:border-b-0 md:border-r p-4">
          <div className="flex md:flex-col space-x-2 md:space-x-0 md:space-y-2">
            <button
              onClick={addText}
              disabled={!isEditorReady}
              className="flex-1 md:flex-none px-3 py-2 text-center md:text-left hover:bg-gray-100 rounded disabled:opacity-50"
            >
              Add Text
            </button>
            <button
              onClick={() => addShape('rectangle')}
              disabled={!isEditorReady}
              className="flex-1 md:flex-none px-3 py-2 text-center md:text-left hover:bg-gray-100 rounded disabled:opacity-50"
            >
              Rectangle
            </button>
            <button
              onClick={() => addShape('circle')}
              disabled={!isEditorReady}
              className="flex-1 md:flex-none px-3 py-2 text-center md:text-left hover:bg-gray-100 rounded disabled:opacity-50"
            >
              Circle
            </button>
          </div>
        </div>

        {/* Canvas Container */}
        <div className="flex-1 overflow-auto p-4 bg-gray-100">
          <div className="relative w-full h-[calc(100vh-180px)] flex items-center justify-center">
            <div className="relative bg-white rounded-lg shadow-lg" style={{
              width: canvasSize.width,
              height: canvasSize.height
            }}>
              <canvas
                ref={canvasRef}
                className="absolute inset-0"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Editor;