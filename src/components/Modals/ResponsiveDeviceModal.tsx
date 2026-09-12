import React, { useState } from 'react';
import {
  Smartphone,
  Tablet,
  Monitor,
  RotateCw,
  X,
  ExternalLink,
  Sparkles,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Cpu
} from 'lucide-react';
import { ResponsiveDevice } from '../../types';

interface ResponsiveDeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeUrl: string;
  pageTitle: string;
}

interface DevicePreset {
  id: ResponsiveDevice;
  name: string;
  width: number;
  height: number;
  icon: 'phone' | 'tablet' | 'desktop';
  userAgent: string;
}

const PRESETS: DevicePreset[] = [
  {
    id: 'iphone15',
    name: 'iPhone 15 Pro',
    width: 393,
    height: 852,
    icon: 'phone',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X)',
  },
  {
    id: 'pixel8',
    name: 'Google Pixel 8',
    width: 412,
    height: 915,
    icon: 'phone',
    userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 8)',
  },
  {
    id: 'ipad',
    name: 'iPad Pro 11"',
    width: 834,
    height: 1194,
    icon: 'tablet',
    userAgent: 'Mozilla/5.0 (iPad; CPU OS 17_4 like Mac OS X)',
  },
  {
    id: 'desktop',
    name: 'MacBook Pro 16"',
    width: 1280,
    height: 800,
    icon: 'desktop',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
  },
];

export const ResponsiveDeviceModal: React.FC<ResponsiveDeviceModalProps> = ({
  isOpen,
  onClose,
  activeUrl,
  pageTitle,
}) => {
  const [selectedDevice, setSelectedDevice] = useState<DevicePreset>(PRESETS[0]);
  const [isLandscape, setIsLandscape] = useState<boolean>(false);
  const [scale, setScale] = useState<number>(0.85);

  if (!isOpen) return null;

  const currentWidth = isLandscape ? selectedDevice.height : selectedDevice.width;
  const currentHeight = isLandscape ? selectedDevice.width : selectedDevice.height;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center p-4">
      {/* Top Toolbar */}
      <div className="w-full max-w-5xl bg-slate-900 text-white rounded-2xl border border-slate-700 p-3 shadow-2xl flex flex-wrap items-center justify-between gap-3 mb-4">
        {/* Device Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-800 p-1 rounded-xl">
          {PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => setSelectedDevice(preset)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedDevice.id === preset.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {preset.icon === 'phone' ? (
                <Smartphone className="w-3.5 h-3.5" />
              ) : preset.icon === 'tablet' ? (
                <Tablet className="w-3.5 h-3.5" />
              ) : (
                <Monitor className="w-3.5 h-3.5" />
              )}
              <span>{preset.name}</span>
            </button>
          ))}
        </div>

        {/* Dimension & Orientation Controls */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1 text-slate-300 font-mono bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
            <span>{currentWidth}</span>
            <span className="text-slate-500">×</span>
            <span>{currentHeight} px</span>
          </div>

          <button
            onClick={() => setIsLandscape(!isLandscape)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer border border-slate-700"
            title="Rotate Orientation"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>{isLandscape ? 'Landscape' : 'Portrait'}</span>
          </button>

          {/* Scale Stepper */}
          <div className="flex items-center gap-1 bg-slate-800 p-0.5 rounded-xl border border-slate-700">
            <button
              onClick={() => setScale((s) => Math.max(0.4, Number((s - 0.1).toFixed(2))))}
              className="p-1 hover:text-white text-slate-400 cursor-pointer"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono text-[11px] px-1.5 text-slate-300">
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={() => setScale((s) => Math.min(1.2, Number((s + 0.1).toFixed(2))))}
              className="p-1 hover:text-white text-slate-400 cursor-pointer"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Close */}
        <button
          onClick={onClose}
          className="p-2 rounded-xl bg-slate-800 hover:bg-rose-600 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Device Viewport Canvas Container */}
      <div className="flex-1 w-full flex items-center justify-center overflow-auto p-4">
        <div
          style={{
            transform: `scale(${scale})`,
            transformOrigin: 'center center',
            transition: 'transform 0.15s ease',
          }}
          className="relative rounded-[40px] p-3 bg-slate-800 border-4 border-slate-700 shadow-2xl shrink-0"
        >
          {/* Mock Camera Notch for phone */}
          {selectedDevice.icon === 'phone' && !isLandscape && (
            <div className="absolute top-5 left-1/2 -translate-x-1/2 w-24 h-5 bg-slate-900 rounded-full z-20 flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-800 border border-slate-700" />
            </div>
          )}

          {/* Screen Display */}
          <div
            style={{
              width: `${currentWidth}px`,
              height: `${currentHeight}px`,
            }}
            className="bg-white rounded-[32px] overflow-hidden flex flex-col relative shadow-inner"
          >
            {/* Mock Mobile Status Bar */}
            <div className="h-7 bg-slate-900 text-white px-5 flex items-center justify-between text-[10px] font-semibold select-none shrink-0">
              <span>9:41</span>
              <div className="flex items-center gap-1.5 text-[10px]">
                <span>5G</span>
                <span>100%</span>
              </div>
            </div>

            {/* Simulated Web Page Content */}
            <div className="flex-1 overflow-y-auto p-4 bg-slate-50 text-slate-900 select-text">
              <div className="max-w-md mx-auto space-y-4">
                <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                  <div className="text-xs font-bold text-blue-600 truncate">{activeUrl}</div>
                  <h1 className="text-base font-bold text-slate-900 mt-1">{pageTitle}</h1>
                  <p className="text-xs text-slate-500 mt-1">
                    Rendered in real-time responsive simulation mode with touch-viewport constraints.
                  </p>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900">
                  <span className="font-bold">Device Viewport Active:</span> Testing fluid CSS media
                  queries (`sm:`, `md:`), viewport scaling, and touch interaction targets.
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">User-Agent</span>
                    <p className="text-[11px] text-slate-700 mt-1 font-mono line-clamp-2">
                      {selectedDevice.userAgent}
                    </p>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">DPR</span>
                    <p className="text-[11px] text-slate-700 mt-1 font-mono">3.00x Retina Display</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
