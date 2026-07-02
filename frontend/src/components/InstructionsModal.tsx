'use client';

import { useState } from 'react';

export function InstructionsModal() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="absolute bottom-4 left-4 z-50 w-12 h-12 bg-white/10 hover:bg-white/30 backdrop-blur-md border border-white/20 text-white rounded-full flex items-center justify-center text-xl font-bold transition-colors shadow-lg"
        aria-label="Instructions"
      >
        ?
      </button>

      {isOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-gray-900 border border-white/20 text-white p-8 rounded-2xl max-w-2xl w-full shadow-2xl relative">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
              aria-label="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <h2 className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
              How to use Reality Sandbox
            </h2>
            
            <div className="space-y-6 text-gray-200 overflow-y-auto max-h-[60vh] pr-4">
              <section>
                <h3 className="text-xl font-semibold mb-2 text-white">The Goal</h3>
                <p>
                  This app grants you &quot;telekinesis&quot; powers. Using your webcam and AI, it allows you to manipulate real physical objects, draw 3D shapes in the air, and spawn furniture into reality.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-2 text-blue-400">Core Gestures</h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong>Pinch (Index + Thumb):</strong> Used to grab objects, draw 3D ink, or drop lasso dots.</li>
                  <li><strong>Open Palm / Open Hand:</strong> Drop whatever you are holding.</li>
                  <li><strong>Closed Fist:</strong> While grabbing an object, switch to a closed fist to instantly lock the object in mid-air (removes gravity).</li>
                  <li><strong className="text-red-400">Thumbs Down:</strong> While grabbing an object, switch to a thumbs down to instantly DELETE it from reality!</li>
                  <li><strong>Move Hand:</strong> Drag grabbed objects through 3D space.</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-2 text-green-400">Mode: Auto-Telekinesis (Default)</h3>
                <p>
                  The AI draws <span className="text-green-400 font-bold">green bounding boxes</span> around recognized objects on your desk. Simply Pinch over a green box to magically extract the real object from your camera feed.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-2 text-cyan-400">Mode: Freeze Reality (Lasso)</h3>
                <p>
                  Click the <strong>Freeze Reality</strong> button. The camera feed will pause. Use the Pinch gesture to drop dots around the outline of any custom object. Connect the last dot to the first dot to extract your custom shape!
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-2 text-purple-400">Mode: Free Form Drawing</h3>
                <p>
                  Click the <strong>Drawing Mode</strong> toggle. Open the floating color palette on the right. Pinch and drag your hand through the air to draw glowing 3D paths. Release your pinch to turn the path into a physical object.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-2 text-yellow-400">Mode: AI Furniture Spawner</h3>
                <p>
                  Use the Furniture menu on the left side of the screen to type a request (e.g., &quot;table&quot;, &quot;chair&quot;). The system will procedurally generate detailed 3D furniture that drops into your room. You can grab and lock these just like any other object.
                </p>
              </section>
            </div>
            
            <div className="mt-8 flex justify-end">
              <button
                onClick={() => setIsOpen(false)}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors"
              >
                Let&apos;s go!
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
