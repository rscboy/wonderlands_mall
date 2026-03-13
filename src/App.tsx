import React, { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Html, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { ShoppingBag, X, ExternalLink, ArrowRight, ShieldCheck, Building2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Data Models ---
type Product = {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  position: [number, number, number];
};

type NavNode = {
  targetId: string;
  label: string;
  position: [number, number, number];
};

type Environment = {
  id: string;
  name: string;
  imageUrl: string;
  products: Product[];
  navNodes: NavNode[];
};

const environments: Environment[] = [
  {
    id: 'boutique',
    name: 'Clothing Boutique',
    imageUrl: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=3128&auto=format&fit=crop',
    products: [
      { id: 'b1', name: 'Denim Jacket', price: 89.99, description: 'Classic denim jacket.', image: 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=500&q=80', position: [-150, -10, -100] },
      { id: 'b2', name: 'Floral Dress', price: 59.99, description: 'Lightweight summer dress.', image: 'https://images.unsplash.com/photo-1515347619362-71fe0908d719?w=500&q=80', position: [200, -20, -50] },
    ],
    navNodes: [
      { targetId: 'tech', label: 'Walk to Tech Store', position: [0, -30, 200] }
    ]
  },
  {
    id: 'tech',
    name: 'Tech Store',
    imageUrl: 'https://images.unsplash.com/photo-1512428559087-560fa5ceab42?q=80&w=3128&auto=format&fit=crop',
    products: [
      { id: 't1', name: 'Pro Smartphone', price: 999.99, description: 'Latest generation smartphone.', image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&q=80', position: [-100, -20, 150] },
      { id: 't2', name: 'Wireless Earbuds', price: 199.99, description: 'Noise-cancelling earbuds.', image: 'https://images.unsplash.com/photo-1572569432711-4f8e4d389069?w=500&q=80', position: [150, 10, -100] },
    ],
    navNodes: [
      { targetId: 'boutique', label: 'Back to Boutique', position: [200, -20, 100] },
      { targetId: 'party', label: 'Enter Christmas Party', position: [-200, -10, -50] }
    ]
  },
  {
    id: 'party',
    name: 'Christmas Party',
    imageUrl: 'https://images.unsplash.com/photo-1544928147-79a2dbc1f389?q=80&w=3128&auto=format&fit=crop',
    products: [
      { id: 'p1', name: 'Festive Ornament', price: 14.99, description: 'Hand-painted glass ornament.', image: 'https://images.unsplash.com/photo-1543589077-47d81606c1bf?w=500&q=80', position: [-50, 50, -150] },
      { id: 'p2', name: 'Gift Box Set', price: 39.99, description: 'Set of 3 premium gift boxes.', image: 'https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?w=500&q=80', position: [100, -40, -100] },
    ],
    navNodes: [
      { targetId: 'tech', label: 'Back to Tech Store', position: [150, -20, 150] },
      { targetId: 'dinner', label: 'Go to Dinner', position: [-150, -10, 100] }
    ]
  },
  {
    id: 'dinner',
    name: 'Nice Dinner',
    imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=3128&auto=format&fit=crop',
    products: [
      { id: 'd1', name: 'Vintage Wine', price: 149.99, description: 'Aged red wine bottle.', image: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=500&q=80', position: [-80, -30, -120] },
      { id: 'd2', name: 'Gourmet Steak', price: 65.00, description: 'Premium cut steak dinner.', image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&q=80', position: [100, -50, -80] },
    ],
    navNodes: [
      { targetId: 'party', label: 'Back to Party', position: [180, -10, 100] },
      { targetId: 'bar', label: 'Go to Bar', position: [-180, -20, 50] }
    ]
  },
  {
    id: 'bar',
    name: 'Cocktail Bar',
    imageUrl: 'https://images.unsplash.com/photo-1572116469696-31de0f17cc34?q=80&w=3128&auto=format&fit=crop',
    products: [
      { id: 'bar1', name: 'Signature Cocktail', price: 18.00, description: 'House special mixed drink.', image: 'https://images.unsplash.com/photo-1536935338788-846bb9981813?w=500&q=80', position: [-100, -20, -150] },
      { id: 'bar2', name: 'Craft Whiskey', price: 85.00, description: 'Small batch bourbon whiskey.', image: 'https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=500&q=80', position: [120, 10, -120] },
    ],
    navNodes: [
      { targetId: 'dinner', label: 'Back to Dinner', position: [150, -20, 150] },
      { targetId: 'bookstore', label: 'Visit Bookstore', position: [-150, -10, 150] }
    ]
  },
  {
    id: 'bookstore',
    name: 'Bookstore',
    imageUrl: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=3128&auto=format&fit=crop',
    products: [
      { id: 'book1', name: 'Bestseller Novel', price: 24.99, description: 'Award-winning fiction novel.', image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500&q=80', position: [-120, 10, -100] },
      { id: 'book2', name: 'Leather Journal', price: 35.00, description: 'Handcrafted leather-bound journal.', image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=500&q=80', position: [100, -20, -150] },
    ],
    navNodes: [
      { targetId: 'bar', label: 'Back to Bar', position: [180, -10, 100] },
      { targetId: 'cafe', label: 'Go to Cafe', position: [-180, -20, 50] }
    ]
  },
  {
    id: 'cafe',
    name: 'Coffee Shop',
    imageUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=3128&auto=format&fit=crop',
    products: [
      { id: 'cafe1', name: 'Artisan Espresso', price: 4.50, description: 'Freshly brewed single-origin espresso.', image: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=500&q=80', position: [-80, -10, -150] },
      { id: 'cafe2', name: 'Butter Croissant', price: 3.75, description: 'Flaky, buttery, freshly baked croissant.', image: 'https://images.unsplash.com/photo-1517433670267-08bbd4be890f?w=500&q=80', position: [120, -30, -100] },
    ],
    navNodes: [
      { targetId: 'bookstore', label: 'Back to Bookstore', position: [150, -20, 150] },
      { targetId: 'boutique', label: 'Return to Entrance', position: [-150, -10, 150] }
    ]
  }
];

function StoreEnvironment({ imageUrl }: { imageUrl: string }) {
  const texture = useTexture(imageUrl);
  texture.wrapS = THREE.RepeatWrapping;
  texture.repeat.x = -1;
  
  return (
    <mesh>
      <sphereGeometry args={[500, 60, 40]} />
      <meshBasicMaterial map={texture} side={THREE.BackSide} />
    </mesh>
  );
}

function ProductHotspot({ product, onClick }: { product: Product, onClick: (p: Product) => void }) {
  return (
    <Html position={product.position} center zIndexRange={[100, 0]}>
      <button 
        onClick={() => onClick(product)}
        className="group relative flex items-center justify-center cursor-pointer"
      >
        <div className="absolute inset-0 bg-blue-400/20 rounded animate-pulse" />
        <div className="bg-[#0b223f]/90 backdrop-blur-md px-3 py-1.5 rounded border border-blue-400/30 shadow-lg text-xs font-mono text-blue-100 flex items-center gap-2 hover:bg-blue-900/60 hover:border-blue-400/60 transition-all duration-300">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_5px_rgba(96,165,250,0.8)]"></div>
          ${product.price.toFixed(2)}
        </div>
      </button>
    </Html>
  );
}

function NavHotspot({ node, onNavigate }: { node: NavNode, onNavigate: (id: string) => void }) {
  return (
    <Html position={node.position} center zIndexRange={[100, 0]}>
      <button 
        onClick={() => onNavigate(node.targetId)}
        className="group relative flex items-center justify-center cursor-pointer"
      >
        <div className="absolute inset-0 bg-slate-500/20 rounded animate-pulse" />
        <div className="bg-[#1e293b]/90 backdrop-blur-md px-3 py-1.5 rounded border border-slate-500/40 shadow-lg text-[10px] uppercase tracking-widest font-sans text-slate-200 flex items-center gap-2 hover:bg-slate-700 hover:border-slate-400 transition-all duration-300">
          {node.label}
          <ArrowRight size={12} className="text-slate-400" />
        </div>
      </button>
    </Html>
  );
}

export default function App() {
  const [currentEnvId, setCurrentEnvId] = useState<string>('boutique');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const currentEnv = environments.find(e => e.id === currentEnvId) || environments[0];

  return (
    <div className="w-full h-screen bg-[#051124] relative overflow-hidden font-sans flex flex-col selection:bg-blue-900/50">
      
      {/* Top Navigation Bar */}
      <nav className="w-full bg-[#0b223f]/95 backdrop-blur-xl text-slate-200 py-4 px-6 md:px-10 border-b border-blue-400/20 flex flex-col md:flex-row items-center justify-between z-20 relative pointer-events-auto shadow-sm">
        <div className="flex items-center gap-4 mb-4 md:mb-0">
          <div className="w-8 h-8 rounded border border-blue-400/30 flex items-center justify-center bg-blue-900/20 shadow-[inset_0_0_10px_rgba(96,165,250,0.1)]">
            <Building2 className="text-blue-300" size={16} />
          </div>
          <h1 className="text-xl md:text-2xl font-serif tracking-wide text-white">Wonderlands Mall</h1>
          <div className="hidden md:flex items-center gap-2 ml-4 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-[10px] uppercase tracking-widest font-mono">
            <ShieldCheck size={12} /> Secure Session
          </div>
        </div>
        
        {/* Quick Navigation Menu */}
        <div className="flex gap-2 overflow-x-auto max-w-full pb-2 md:pb-0 scrollbar-hide">
          {environments.map(env => (
            <button
              key={env.id}
              onClick={() => setCurrentEnvId(env.id)}
              className={`px-4 py-2 rounded text-[11px] tracking-widest uppercase font-medium transition-all border ${
                currentEnvId === env.id 
                  ? 'bg-blue-900/40 border-blue-400/50 text-blue-100 shadow-[0_0_15px_rgba(96,165,250,0.1)]' 
                  : 'border-transparent text-slate-400 hover:border-blue-400/20 hover:text-slate-200 hover:bg-[#1e3a8a]/20'
              }`}
            >
              {env.name}
            </button>
          ))}
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="flex-1 relative w-full h-full">
        {/* Environment Label Overlay */}
        <div className="absolute top-8 left-8 z-10 pointer-events-none">
          <div className="bg-[#0b223f]/80 backdrop-blur-xl text-slate-200 px-8 py-6 rounded-lg border border-blue-400/20 shadow-2xl">
            <h2 className="text-3xl font-serif text-white mb-3 tracking-wide">{currentEnv.name}</h2>
            <div className="h-px w-16 bg-blue-400/40 mb-4"></div>
            <p className="text-[10px] text-blue-300/70 font-mono tracking-widest uppercase">Sector {currentEnv.id.toUpperCase()}</p>
          </div>
        </div>

        {/* 3D Canvas */}
        <Canvas camera={{ position: [0, 0, 0.1], fov: 100 }}>
          <Suspense fallback={
            <Html center>
              <div className="bg-[#0b223f]/90 text-blue-100 px-6 py-4 rounded border border-blue-400/30 backdrop-blur-md font-mono text-xs uppercase tracking-widest flex items-center gap-4 whitespace-nowrap shadow-2xl">
                <div className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                Initializing {currentEnv.name}...
              </div>
            </Html>
          }>
            <StoreEnvironment key={currentEnv.id} imageUrl={currentEnv.imageUrl} />
            
            {currentEnv.products.map(product => (
              <ProductHotspot key={product.id} product={product} onClick={setSelectedProduct} />
            ))}
            
            {currentEnv.navNodes.map(node => (
              <NavHotspot key={node.targetId} node={node} onNavigate={setCurrentEnvId} />
            ))}
          </Suspense>
          
          <OrbitControls 
            enableZoom={false} 
            enablePan={false} 
            rotateSpeed={-0.3}
            minPolarAngle={Math.PI / 2 - 0.15}
            maxPolarAngle={Math.PI / 2 + 0.15}
          />
        </Canvas>

        {/* Product Modal Overlay */}
        <AnimatePresence>
          {selectedProduct && (
            <motion.div 
              initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
              animate={{ opacity: 1, backdropFilter: "blur(8px)" }}
              exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
              className="absolute inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-[#051124]/80"
              onClick={() => setSelectedProduct(null)}
            >
              <motion.div 
                initial={{ scale: 0.98, y: 10, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.98, y: 10, opacity: 0 }}
                transition={{ type: "spring", damping: 30, stiffness: 400 }}
                className="bg-[#0b223f] border border-blue-400/20 rounded-xl overflow-hidden shadow-2xl max-w-5xl w-full flex flex-col md:flex-row max-h-[85vh]"
                onClick={e => e.stopPropagation()}
              >
                {/* Left: Image Hero */}
                <div className="relative h-64 md:h-auto md:w-1/2 shrink-0 bg-[#051124]">
                  <img 
                    src={selectedProduct.image} 
                    alt={selectedProduct.name}
                    className="w-full h-full object-cover opacity-70 mix-blend-luminosity"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-[#0b223f] via-transparent to-transparent opacity-80" />
                  <div className="absolute top-6 left-6">
                    <div className="px-3 py-1 rounded border border-blue-400/30 bg-[#0b223f]/60 backdrop-blur-md text-blue-200 text-[10px] uppercase font-mono tracking-widest">
                      Asset View
                    </div>
                  </div>
                </div>
                
                {/* Right: Details & Actions */}
                <div className="p-8 md:p-12 md:w-1/2 overflow-y-auto flex flex-col relative bg-[#0b223f]">
                  <button 
                    onClick={() => setSelectedProduct(null)}
                    className="absolute top-6 right-6 text-slate-400 hover:text-white p-2 rounded hover:bg-white/5 transition-all"
                  >
                    <X size={20} />
                  </button>
                  
                  <div className="mb-10 mt-4 md:mt-0">
                    <div className="text-[10px] font-mono text-blue-400/80 mb-4 tracking-widest uppercase flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                      ID: {selectedProduct.id.padStart(6, '0')}
                    </div>
                    <h2 className="text-3xl md:text-4xl font-serif text-white leading-tight mb-6 tracking-wide">{selectedProduct.name}</h2>
                    
                    <div className="h-px w-full bg-blue-400/10 mb-6"></div>
                    
                    <div className="flex items-baseline gap-1 mb-6">
                      <span className="text-lg text-blue-300 font-serif">$</span>
                      <span className="text-4xl font-serif text-blue-100">{selectedProduct.price.toFixed(2)}</span>
                      <span className="text-xs text-slate-500 font-mono ml-2 uppercase">USD</span>
                    </div>
                    
                    <p className="text-slate-300 text-sm leading-relaxed font-sans font-light">
                      {selectedProduct.description}
                    </p>
                  </div>
                  
                  <div className="mt-auto flex flex-col gap-3 pt-6 border-t border-blue-400/10">
                    <button className="w-full bg-blue-900/40 border border-blue-400/40 text-blue-100 py-3.5 px-6 rounded text-xs tracking-widest uppercase font-semibold hover:bg-blue-800/60 hover:border-blue-400/60 transition-all flex items-center justify-center gap-3 shadow-[0_0_15px_rgba(96,165,250,0.05)]">
                      <ShoppingBag size={16} />
                      Authorize Transaction
                    </button>
                    <button className="w-full bg-transparent border border-slate-600/50 text-slate-300 py-3.5 px-6 rounded text-xs tracking-widest uppercase font-semibold hover:bg-slate-800/50 hover:text-white transition-all flex items-center justify-center gap-3">
                      <ExternalLink size={16} />
                      View Audit Trail
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
