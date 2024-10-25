"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Bell, AlertCircle, Radio, History, Settings } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const DAMAGE_THRESHOLD = 70;
const FRAME_PROCESSING_INTERVAL = 100; // Process every 100ms instead of every frame
const DETECTION_BATCH_SIZE = 3; // Process every 3rd frame

const LiveVideoPlayerUI = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const workerRef = useRef(null);
  const processingRef = useRef(false);
  const frameCountRef = useRef(0);
  const lastProcessedTimeRef = useRef(0);

  const [isStreaming, setIsStreaming] = useState(false);
  const [detections, setDetections] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [damageLevel, setDamageLevel] = useState(0);

  // Memoize heavy computations
  const processDamageLevel = useCallback((predictions) => {
    if (!Array.isArray(predictions)) return 0;
    
    const damageClasses = predictions.filter(pred => 
      pred.class.toLowerCase().includes('damage') ||
      pred.class.toLowerCase().includes('injury') ||
      pred.class.toLowerCase().includes('wound')
    );

    if (damageClasses.length === 0) return 0;
    return damageClasses.reduce((acc, curr) => 
      acc + (curr.confidence * 100), 0) / damageClasses.length;
  }, []);

  const addAlert = useCallback((message, severity) => {
    setAlerts(prev => [{
      id: Date.now(),
      message,
      severity,
      timestamp: new Date().toLocaleTimeString()
    }, ...prev].slice(0, 5));
  }, []);

  // Optimized frame processing
  const processFrame = useCallback(async () => {
    if (!canvasRef.current || !videoRef.current || processingRef.current) return;
    
    const now = performance.now();
    if (now - lastProcessedTimeRef.current < FRAME_PROCESSING_INTERVAL) return;
    
    frameCountRef.current++;
    if (frameCountRef.current % DETECTION_BATCH_SIZE !== 0) return;
    
    processingRef.current = true;
    lastProcessedTimeRef.current = now;

    const ctx = canvasRef.current.getContext("2d", { alpha: false });
    ctx.drawImage(videoRef.current, 0, 0, 640, 480);

    try {
      // Use ImageBitmap for faster image processing
      const bitmap = await createImageBitmap(videoRef.current);
      const imageData = canvasRef.current.toDataURL("image/jpeg", 0.8); // Reduced quality for faster upload

      const response = await fetch("https://detect.roboflow.com/YOUR_MODEL_ENDPOINT", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "aw95wl1ITI6IPxINEf4C",
        },
        body: JSON.stringify({ image: imageData }),
      });

      const predictions = await response.json();
      const validPredictions = Array.isArray(predictions) ? 
        predictions : (predictions?.predictions || []);

      // Batch state updates
      const currentDamageLevel = processDamageLevel(validPredictions);
      
      requestAnimationFrame(() => {
        setDetections(validPredictions);
        setDamageLevel(currentDamageLevel);
        
        if (currentDamageLevel > DAMAGE_THRESHOLD) {
          addAlert(`High damage detected! Level: ${currentDamageLevel.toFixed(1)}%`, 'critical');
        }

        // Optimized rendering
        ctx.clearRect(0, 0, 640, 480);
        ctx.drawImage(bitmap, 0, 0);
        
        validPredictions.forEach((detection) => {
          const isDamage = detection.class.toLowerCase().includes('damage');
          const color = isDamage ? 
            `rgb(255, ${Math.max(0, 255 - (detection.confidence * 255))}, 0)` : 
            '#00ff00';

          // Batch drawing operations
          ctx.save();
          ctx.strokeStyle = color;
          ctx.lineWidth = isDamage ? 3 : 2;
          ctx.strokeRect(
            detection.bbox.x,
            detection.bbox.y,
            detection.bbox.width,
            detection.bbox.height
          );

          const label = `${detection.class} ${Math.round(detection.confidence * 100)}%`;
          ctx.font = "16px Arial";
          const textMetrics = ctx.measureText(label);
          
          ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
          ctx.fillRect(
            detection.bbox.x,
            detection.bbox.y - 25,
            textMetrics.width + 8,
            25
          );

          ctx.fillStyle = color;
          ctx.fillText(label, detection.bbox.x + 4, detection.bbox.y - 7);
          ctx.restore();
        });

        bitmap.close();
      });

    } catch (error) {
      console.error("Detection error:", error);
    } finally {
      processingRef.current = false;
    }
  }, [processDamageLevel, addAlert]);

  // Initialize video stream with optimized settings
  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: 'environment',
            frameRate: { ideal: 30 }
          },
        });

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setIsStreaming(true);

          // Use requestAnimationFrame for smooth rendering
          const animate = () => {
            processFrame();
            if (streamRef.current) {
              requestAnimationFrame(animate);
            }
          };
          
          requestAnimationFrame(animate);
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        setIsStreaming(false);
      }
    };

    startCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [processFrame]);


  return (
    <SidebarProvider>
      <div className="flex h-screen bg-background">
        <Sidebar>
          <SidebarHeader>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton size="lg">
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <Radio className="size-4" />
                  </div>
                  <span className="font-semibold">Live Video</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
            <div className="px-4 py-2">
              <Input placeholder="Search..." />
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Radio className="mr-2 h-4 w-4" />
                  Live
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <AlertCircle className="mr-2 h-4 w-4" />
                  Alerts ({alerts.length})
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <History className="mr-2 h-4 w-4" />
                  History
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Bell className="mr-2 h-4 w-4" />
                  Notifications
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          <SidebarRail />
        </Sidebar>
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto p-4">
            <header className="mb-4 flex items-center justify-between">
              <div className="flex items-center">
                <SidebarTrigger className="mr-4" />
                <h1 className="text-2xl font-bold">Live Video Stream</h1>
              </div>
              {damageLevel > DAMAGE_THRESHOLD && (
                <Alert variant="destructive" className="w-auto">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>High Damage Detected!</AlertTitle>
                  <AlertDescription>
                    Current damage level: {damageLevel.toFixed(1)}%
                  </AlertDescription>
                </Alert>
              )}
            </header>
            
            <div className="grid gap-4 md:grid-cols-3">
              <div className="md:col-span-2">
                <div className="aspect-video w-full overflow-hidden rounded-lg bg-muted">
                  <div className="relative h-full">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                    <canvas
                      ref={canvasRef}
                      width="640"
                      height="480"
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="rounded-lg border p-4">
                  <h2 className="text-xl font-semibold mb-2">Stream Information</h2>
                  <div className="space-y-2">
                    <p className="text-muted-foreground">
                      Status: {isStreaming ? "Live" : "Offline"}
                    </p>
                    <p className="text-muted-foreground">
                      Detections: {detections.length} objects found
                    </p>
                    <p className="text-muted-foreground">
                      Current Damage Level: {damageLevel.toFixed(1)}%
                    </p>
                  </div>
                </div>

                <div className="rounded-lg border p-4">
                  <h2 className="text-xl font-semibold mb-2">Recent Alerts</h2>
                  <div className="space-y-2">
                    {alerts.map((alert) => (
                      <Alert 
                        key={alert.id}
                        variant={alert.severity === 'critical' ? 'destructive' : 'default'}
                      >
                        <AlertTitle>{alert.timestamp}</AlertTitle>
                        <AlertDescription>{alert.message}</AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </div>

                <div className="rounded-lg border p-4">
                  <h2 className="text-xl font-semibold mb-2">Recent Detections</h2>
                  <ul className="space-y-1">
                    {detections.slice(0, 5).map((detection, index) => (
                      <li key={index} className="flex justify-between">
                        <span>{detection.class}</span>
                        <span className="text-muted-foreground">
                          {Math.round(detection.confidence * 100)}%
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default LiveVideoPlayerUI;