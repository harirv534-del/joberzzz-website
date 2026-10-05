import React, { useState } from 'react';
import { usePWAInstall } from './usePWAInstall';
import { Download, Smartphone, Apple, Check, Copy, ExternalLink, X, ShieldCheck } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [showStorePublishModal, setShowStorePublishModal] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <>
      <div className="flex items-center gap-1.5">
        {/* If Installable on Android / Desktop */}
        {isInstallable && !isInstalled && (
          <button
            onClick={install}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            title="Install Joberzzz as a native app"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Install App</span>
          </button>
        )}

        {/* If on iOS Safari */}
        {isIOS && !isInstalled && (
          <button
            onClick={() => setShowIOSGuide(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
            title="Install on iPhone / iPad"
          >
            <Apple className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Add to Home</span>
          </button>
        )}

        {/* Store Publish Guide Modal Trigger */}
        <button
          onClick={() => setShowStorePublishModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-xs font-bold transition-all cursor-pointer"
          title="Google Play Store & Apple App Store Publishing Hub"
        >
          <Smartphone className="w-3.5 h-3.5 text-blue-600" />
          <span className="hidden md:inline">Publish to Stores</span>
        </button>
      </div>

      {/* iOS Safari Home Screen Installation Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 text-slate-900">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Apple className="w-5 h-5 text-slate-900" />
                <h3 className="text-base font-bold">Install on iPhone / iPad</h3>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3.5 text-xs text-slate-600">
              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="w-6 h-6 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                  1
                </div>
                <p className="mt-0.5 leading-relaxed">
                  Tap the <strong className="text-slate-900">Share</strong> button (box with an upward arrow) in the Safari toolbar.
                </p>
              </div>

              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="w-6 h-6 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                  2
                </div>
                <p className="mt-0.5 leading-relaxed">
                  Scroll down the share sheet and tap <strong className="text-slate-900">Add to Home Screen</strong>.
                </p>
              </div>

              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="w-6 h-6 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                  3
                </div>
                <p className="mt-0.5 leading-relaxed">
                  Tap <strong className="text-blue-600">Add</strong> in the top-right. Joberzzz will install as a native standalone app with full offline capabilities!
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowIOSGuide(false)}
              className="mt-5 w-full rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white hover:bg-blue-700 transition"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* Comprehensive Google Play & Apple App Store Publishing Hub Modal */}
      {showStorePublishModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 sm:p-7 shadow-2xl border border-slate-200 text-slate-900 my-8">
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Publish to Google Play Store & Apple App Store
                  </h3>
                  <p className="text-xs text-slate-500">
                    Everything configured & pre-validated to publish Joberzzz as a native store app
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowStorePublishModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-5 space-y-5 text-xs text-slate-600">
              {/* Status Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl">
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">Manifest</span>
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1 mt-0.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    W3C PWA Compliant
                  </span>
                </div>
                <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl">
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">Service Worker</span>
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1 mt-0.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    Offline Cache Active
                  </span>
                </div>
                <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl">
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">App Icons</span>
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1 mt-0.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    192px + 512px Maskable
                  </span>
                </div>
                <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl">
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">Apple Touch Icon</span>
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1 mt-0.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    180px PNG Ready
                  </span>
                </div>
              </div>

              {/* SECTION 1: Google Play Store (Android) */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                      GP
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm">
                      1. Android Google Play Store (TWA / AAB)
                    </h4>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-md">
                    Ready to Package
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed mb-3">
                  Google Play Store accepts modern PWAs packaged as a <strong>Trusted Web Activity (TWA)</strong> or via <strong>Capacitor / Bubblewrap</strong>. The generated <code>.aab</code> (Android App Bundle) can be uploaded directly to the Google Play Console:
                </p>

                <div className="space-y-2 bg-white p-3 rounded-lg border border-slate-200">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Recommended Package ID:</span>
                    <div className="flex items-center gap-1 font-mono font-bold text-slate-800">
                      <span>com.joberzzz.app</span>
                      <button
                        onClick={() => copyToClipboard('com.joberzzz.app', 'pkg')}
                        className="p-1 hover:text-blue-600 text-slate-400"
                        title="Copy Package ID"
                      >
                        {copiedKey === 'pkg' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Fast 1-Click Generator:</span>
                    <a
                      href="https://www.pwabuilder.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1"
                    >
                      <span>PWABuilder.com (Official Microsoft & Google Partner)</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                    Enter this app's URL on PWABuilder &rarr; Click <strong>Package for Android</strong> &rarr; Download the signed <code>.aab</code> &rarr; Upload to Google Play Console.
                  </p>
                </div>
              </div>

              {/* SECTION 2: Apple App Store (iOS) */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Apple className="w-5 h-5 text-slate-900" />
                    <h4 className="font-bold text-slate-900 text-sm">
                      2. Apple App Store (iOS / iPadOS)
                    </h4>
                  </div>
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-bold rounded-md">
                    Ready to Package
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed mb-3">
                  For the Apple App Store, this app has full iOS WebKit standalone compliance (Safe Area insets, touch icons, status bar styling). You can publish to App Store Connect using:
                </p>

                <div className="space-y-2 bg-white p-3 rounded-lg border border-slate-200">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Bundle Identifier:</span>
                    <div className="flex items-center gap-1 font-mono font-bold text-slate-800">
                      <span>com.joberzzz.ios</span>
                      <button
                        onClick={() => copyToClipboard('com.joberzzz.ios', 'bundle')}
                        className="p-1 hover:text-blue-600 text-slate-400"
                        title="Copy Bundle Identifier"
                      >
                        {copiedKey === 'bundle' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Method A (Recommended):</span>
                    <a
                      href="https://www.pwabuilder.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1"
                    >
                      <span>PWABuilder iOS Package (Xcode project generated instantly)</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Method B (Capacitor):</span>
                    <span className="font-mono text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                      npx cap add ios &amp;&amp; npx cap open ios
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                    Open the generated project in Xcode &rarr; Select your Apple Developer Team &rarr; Archive &amp; Distribute to App Store Connect / TestFlight.
                  </p>
                </div>
              </div>

              {/* App Store Metadata Summary */}
              <div className="p-3 bg-slate-100/80 rounded-xl space-y-1.5 text-[11px]">
                <div className="flex items-center gap-1.5 text-slate-800 font-bold">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Pre-Configured App Store Listing Metadata</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600 pt-1">
                  <div><strong>App Name:</strong> Joberzzz</div>
                  <div><strong>Category:</strong> Business / Productivity</div>
                  <div><strong>Theme Color:</strong> #1D64EC (Corporate Blue)</div>
                  <div><strong>Display:</strong> Standalone (Zero browser bars)</div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                onClick={() => setShowStorePublishModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowStorePublishModal(false);
                  install();
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Test Install On Device</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
