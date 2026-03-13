import React, { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Html, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { ShoppingBag, X, Tag, ExternalLink, ArrowRight, Map, Store } from 'lucide-react';
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
    imageUrl: 'https://images.unsplash.com/photo-1512428559087-560fa5ceab42?q=80&w=3128&auto=format&fit=crop', // Apple store interior
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
    imageUrl: 'https://images.unsplash.com/photo-1544928147-79a2dbc1f389?q=80&w=3128&auto=format&fit=crop', // Wide Christmas room
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
    imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=3128&auto=format&fit=crop', // Wide restaurant
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
    imageUrl: 'https://images.unsplash.com/photo-1572116469696-31de0f17cc34?q=80&w=3128&auto=format&fit=crop', // Wide bar
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
    imageUrl: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=3128&auto=format&fit=crop', // Wide library/bookstore
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
    imageUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=3128&auto=format&fit=crop', // Wide cafe
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
        <div className="absolute inset-0 bg-white/40 rounded-full animate-ping" />
        <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-full shadow-xl text-sm font-bold flex items-center gap-2 hover:bg-black hover:text-white transition-all duration-300 border border-black/5 hover:scale-105">
          <Tag size={16} />
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
        <div className="absolute inset-0 bg-emerald-400/40 rounded-full animate-ping" />
        <div className="bg-emerald-500/90 text-white backdrop-blur-md px-4 py-2 rounded-full shadow-xl text-sm font-bold flex items-center gap-2 hover:bg-emerald-600 transition-all duration-300 border border-white/20 hover:scale-105">
          {node.label}
          <ArrowRight size={16} />
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
    <div className="w-full h-screen bg-neutral-900 relative overflow-hidden font-sans flex flex-col">
      
      {/* Top Navigation Bar */}
      <nav className="w-full bg-black/90 backdrop-blur-xl text-white py-4 px-6 border-b border-white/10 flex flex-col md:flex-row items-center justify-between z-20 relative pointer-events-auto shadow-2xl">
        <div className="flex items-center gap-3 mb-4 md:mb-0">
          <Store className="text-emerald-400" size={28} />
          <h1 className="text-2xl font-bold tracking-tight">Welcome to Winterlands Mall</h1>
        </div>
        
        {/* Quick Navigation Menu */}
        <div className="flex gap-2 overflow-x-auto max-w-full pb-2 md:pb-0 scrollbar-hide">
          {environments.map(env => (
            <button
              key={env.id}
              onClick={() => setCurrentEnvId(env.id)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                currentEnvId === env.id 
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                  : 'text-neutral-300 hover:bg-white/10 hover:text-white'
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
        <div className="absolute top-6 left-6 z-10 pointer-events-none">
          <div className="bg-black/40 backdrop-blur-xl text-white px-6 py-4 rounded-3xl border border-white/10 shadow-2xl">
            <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
              <Map className="text-emerald-400" size={20} />
              {currentEnv.name}
            </h2>
            <p className="text-sm text-neutral-300 mt-1 font-medium">Drag to look around. Click tags to buy, or arrows to move.</p>
          </div>
        </div>

        {/* 3D Canvas */}
        <Canvas camera={{ position: [0, 0, 0.1], fov: 100 }}>
          <Suspense fallback={
            <Html center>
              <div className="bg-black/80 text-white px-6 py-3 rounded-full backdrop-blur-md font-medium flex items-center gap-3 whitespace-nowrap shadow-2xl">
                <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                Loading {currentEnv.name}...
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
            rotateSpeed={-0.4}
            // Restrict polar angle to prevent looking at the distorted top/bottom poles
            minPolarAngle={Math.PI / 2 - 0.2}
            maxPolarAngle={Math.PI / 2 + 0.2}
          />
        </Canvas>

        {/* Product Modal Overlay */}
        <AnimatePresence>
          {selectedProduct && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-black/60 backdrop-blur-sm"
              onClick={() => setSelectedProduct(null)}
            >
              <motion.div 
                initial={{ scale: 0.95, y: 20, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.95, y: 20, opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="bg-white rounded-[2rem] overflow-hidden shadow-2xl max-w-md w-full flex flex-col max-h-[90vh]"
                onClick={e => e.stopPropagation()}
              >
                <div className="relative h-72 w-full shrink-0">
                  <img 
                    src={selectedProduct.image} 
                    alt={selectedProduct.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <button 
                    onClick={() => setSelectedProduct(null)}
                    className="absolute top-4 right-4 bg-black/20 hover:bg-black/60 text-white p-2.5 rounded-full backdrop-blur-md transition-all hover:scale-110"
                  >
                    <X size={20} />
                  </button>
                  <div className="absolute bottom-4 left-6 right-6 flex justify-between items-end">
                    <h2 className="text-2xl font-bold text-white leading-tight drop-shadow-md">{selectedProduct.name}</h2>
                    <span className="text-2xl font-bold text-emerald-400 drop-shadow-md">${selectedProduct.price.toFixed(2)}</span>
                  </div>
                </div>
                
                <div className="p-6 md:p-8 overflow-y-auto">
                  <p className="text-neutral-600 text-lg leading-relaxed mb-8">
                    {selectedProduct.description}
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button className="flex-1 bg-black text-white py-4 px-6 rounded-2xl font-semibold flex items-center justify-center gap-2 hover:bg-neutral-800 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-black/20">
                      <ShoppingBag size={20} />
                      Add to Cart
                    </button>
                    <button className="bg-neutral-100 text-neutral-900 py-4 px-6 rounded-2xl font-semibold flex items-center justify-center gap-2 hover:bg-neutral-200 transition-all hover:scale-[1.02] active:scale-[0.98]">
                      <ExternalLink size={20} />
                      View Details
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
