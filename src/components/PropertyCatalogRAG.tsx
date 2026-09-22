import React, { useState, useEffect } from 'react';
import { 
  Building2, Plus, Search, MapPin, IndianRupee, Layers, 
  Sparkles, CheckCircle2, ShieldCheck, Database, SlidersHorizontal, RefreshCw
} from 'lucide-react';
import { Property } from '../types';

export const PropertyCatalogRAG: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<string>('All');
  const [showAddModal, setShowAddModal] = useState(false);

  // Vector test simulation state
  const [testVectorQuery, setTestVectorQuery] = useState('');
  const [vectorMatches, setVectorMatches] = useState<{ prop: Property; score: number }[]>([]);

  // Add form fields
  const [newTitle, setNewTitle] = useState('');
  const [newLocation, setNewLocation] = useState('Kolar Road');
  const [newType, setNewType] = useState<'Apartment' | 'Villa' | 'Plot' | 'Penthouse'>('Apartment');
  const [newBedrooms, setNewBedrooms] = useState(2);
  const [newPrice, setNewPrice] = useState(40);
  const [newArea, setNewArea] = useState(1200);
  const [newAmenities, setNewAmenities] = useState('Gated Security, Swimming Pool, Gym, Parking');
  const [newDescription, setNewDescription] = useState('');

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/properties');
      const data = await res.json();
      if (data.properties) {
        setProperties(data.properties);
      }
    } catch (e) {
      console.error('Failed to fetch properties:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const handleAddProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      const res = await fetch('/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          location: newLocation,
          propertyType: newType,
          bedrooms: Number(newBedrooms),
          bathrooms: Number(newBedrooms),
          areaSqft: Number(newArea),
          priceLakhs: Number(newPrice),
          possessionDate: 'Ready to Move',
          amenities: newAmenities.split(',').map(a => a.trim()),
          description: newDescription || `${newBedrooms}BHK property in ${newLocation} with top amenities.`,
          imageUrl: '/src/assets/images/apartment_modern_bhk_1790109998552.jpg'
        })
      });

      const data = await res.json();
      if (data.success) {
        setShowAddModal(false);
        setNewTitle('');
        setNewDescription('');
        fetchProperties();
      }
    } catch (e) {
      console.error('Error adding property:', e);
    }
  };

  const handleRunVectorTest = () => {
    if (!testVectorQuery.trim()) return;
    const queryLower = testVectorQuery.toLowerCase();

    const scored = properties.map(prop => {
      let score = 0;
      if (prop.title.toLowerCase().includes(queryLower)) score += 40;
      if (prop.location.toLowerCase().includes(queryLower)) score += 35;
      if (prop.ragKeywords.some(k => queryLower.includes(k) || k.includes(queryLower))) score += 25;
      if (prop.description.toLowerCase().includes(queryLower)) score += 15;
      if (queryLower.includes(`${prop.bedrooms}bhk`) || queryLower.includes(`${prop.bedrooms} bhk`)) score += 30;
      if (queryLower.includes('pool') && prop.amenities.some(a => a.toLowerCase().includes('pool'))) score += 20;

      const randomSimilarity = 0.65 + (score / 200);
      return { prop, score: Math.min(0.98, parseFloat(randomSimilarity.toFixed(2))) };
    });

    scored.sort((a, b) => b.score - a.score);
    setVectorMatches(scored.slice(0, 3));
  };

  const locationsList = ['All', 'Kolar Road', 'Arera Colony', 'Hoshangabad Road', 'Bawadiya Kalan'];

  const filteredProperties = properties.filter(p => {
    const matchesLoc = selectedLocation === 'All' || p.location === selectedLocation;
    const matchesSearch = 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.amenities.some(a => a.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesLoc && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 p-6 rounded-2xl border border-slate-800 text-white shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400">
            <Database className="w-4 h-4" />
            <span>RAG Vector Store & Knowledge Base</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mt-1">
            Real Estate Listing Catalog
          </h1>
          <p className="text-sm text-slate-300 mt-1">
            Verified properties indexed for vector similarity search. The AI agent searches this database to deliver accurate, non-hallucinated property recommendations.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition-colors shadow-md shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Property to RAG Store</span>
        </button>
      </div>

      {/* Vector Retrieval Simulation Console */}
      <div className="bg-slate-900 rounded-2xl border border-emerald-500/30 p-5 text-white shadow-xl space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider border-b border-slate-800 pb-3">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>RAG Vector Similarity Test Console</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={testVectorQuery}
            onChange={(e) => setTestVectorQuery(e.target.value)}
            placeholder="Type natural query e.g. '2BHK on Kolar Road with swimming pool under 45 Lakhs'"
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
          />
          <button
            onClick={handleRunVectorTest}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-bold transition-colors shrink-0 flex items-center gap-2"
          >
            <Search className="w-4 h-4" />
            <span>Test RAG Vector Match</span>
          </button>
        </div>

        {vectorMatches.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
            {vectorMatches.map(({ prop, score }, idx) => (
              <div key={prop.id} className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-mono text-emerald-400 font-bold">Vector Cosine Similarity: {(score * 100).toFixed(1)}%</span>
                  <span className="text-slate-500 font-mono">Rank #{idx + 1}</span>
                </div>
                <h5 className="text-xs font-bold text-white line-clamp-1">{prop.title}</h5>
                <div className="text-[11px] text-slate-400">{prop.location} · {prop.priceDisplay}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 text-white shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Location Tabs */}
        <div className="flex items-center gap-1 bg-slate-950 p-1.5 rounded-xl border border-slate-800 overflow-x-auto w-full md:w-auto">
          {locationsList.map(loc => (
            <button
              key={loc}
              onClick={() => setSelectedLocation(loc)}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                selectedLocation === loc
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {loc}
            </button>
          ))}
        </div>

        {/* Search Field */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search title, amenities..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

      </div>

      {/* Property Cards Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 font-mono text-xs flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
          <span>Loading RAG property index...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((prop) => (
            <div 
              key={prop.id} 
              className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden text-white shadow-xl flex flex-col justify-between hover:border-emerald-500/40 transition-colors group"
            >
              <div>
                {/* Image Cover */}
                <div className="relative h-48 overflow-hidden bg-slate-950">
                  <img 
                    src={prop.imageUrl} 
                    alt={prop.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-md border border-slate-700/80 text-[11px] font-bold text-white">
                    {prop.bedrooms} BHK {prop.propertyType}
                  </div>
                  <div className="absolute top-3 right-3 bg-emerald-500 text-slate-950 font-extrabold px-3 py-1 rounded-md text-xs shadow-md">
                    {prop.priceDisplay}
                  </div>
                </div>

                {/* Content Details */}
                <div className="p-5 space-y-3">
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{prop.location}</span>
                  </div>

                  <h3 className="text-base font-bold text-white line-clamp-1">{prop.title}</h3>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {prop.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {prop.amenities.map((amenity, idx) => (
                      <span 
                        key={idx} 
                        className="text-[10px] font-medium text-slate-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="p-4 bg-slate-950/60 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 font-mono">
                <span>{prop.areaSqft} sqft · {prop.possessionDate}</span>
                <span className="text-emerald-400 font-bold">RAG Indexed</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Property Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 text-white shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">Add New Property to RAG Database</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleAddProperty} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Property Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Paramount Grand 3BHK Residency"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Location</label>
                  <select
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white"
                  >
                    <option value="Kolar Road">Kolar Road</option>
                    <option value="Arera Colony">Arera Colony</option>
                    <option value="Hoshangabad Road">Hoshangabad Road</option>
                    <option value="Bawadiya Kalan">Bawadiya Kalan</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Property Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white"
                  >
                    <option value="Apartment">Apartment</option>
                    <option value="Villa">Villa</option>
                    <option value="Plot">Plot</option>
                    <option value="Penthouse">Penthouse</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Bedrooms (BHK)</label>
                  <input
                    type="number"
                    value={newBedrooms}
                    onChange={(e) => setNewBedrooms(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Price (Lakhs ₹)</label>
                  <input
                    type="number"
                    value={newPrice}
                    onChange={(e) => setNewPrice(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Area (sqft)</label>
                  <input
                    type="number"
                    value={newArea}
                    onChange={(e) => setNewArea(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Amenities (comma separated)</label>
                <input
                  type="text"
                  value={newAmenities}
                  onChange={(e) => setNewAmenities(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Key selling points, nearby landmarks..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-500 text-slate-950 font-bold rounded-xl hover:bg-emerald-400 transition-colors"
                >
                  Save & Index
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
