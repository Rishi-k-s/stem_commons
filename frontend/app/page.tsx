'use client';

import React, { useState, useEffect } from 'react';
import { SearchBar } from '@/app/components/search/SearchBar';
import { FilterPills } from '@/app/components/search/FilterPills';
import { Button } from '@/app/components/common/Button';
import { Card, CardBody } from '@/app/components/common/Card';
import { Badge } from '@/app/components/common/Badge';
import { useFilter } from '@/app/context/FilterContext';
import { useResource } from '@/app/context/ResourceContext';
import { ResourceType, ResourceStatus, AutocompleteItem } from '@/app/types';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const { filters, updateFilter, clearFilters, loadFiltersFromStorage, saveFiltersToStorage } = useFilter();
  const { setResources, setTotalCount } = useResource();
  
  const [activeResourceTypes, setActiveResourceTypes] = useState<ResourceType[]>([]);
  const [activeStatuses, setActiveStatuses] = useState<ResourceStatus[]>([]);
  const [activeFacilities, setActiveFacilities] = useState<string[]>([]);

  useEffect(() => {
    loadFiltersFromStorage();
  }, []);

  const handleResourceTypeToggle = (type: ResourceType) => {
    setActiveResourceTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
    updateFilter('resourceType', 
      activeResourceTypes.includes(type) 
        ? activeResourceTypes.filter(t => t !== type) 
        : [...activeResourceTypes, type]
    );
  };

  const handleStatusToggle = (status: ResourceStatus) => {
    setActiveStatuses(prev =>
      prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
    );
    updateFilter('status',
      activeStatuses.includes(status)
        ? activeStatuses.filter(s => s !== status)
        : [...activeStatuses, status]
    );
  };

  const handleFacilityToggle = (facility: string) => {
    setActiveFacilities(prev =>
      prev.includes(facility) ? prev.filter(f => f !== facility) : [...prev, facility]
    );
    updateFilter('facilities',
      activeFacilities.includes(facility)
        ? activeFacilities.filter(f => f !== facility)
        : [...activeFacilities, facility]
    );
  };

  const handleSearch = (query: string) => {
    updateFilter('searchQuery', query);
    saveFiltersToStorage();
    router.push('/resources');
  };

  const handleResultSelect = (item: AutocompleteItem) => {
    if (item.type === 'state') {
      updateFilter('state', item.label);
    } else if (item.type === 'district') {
      updateFilter('district', item.label);
    } else if (item.type === 'city') {
      updateFilter('city', item.label);
    }
    saveFiltersToStorage();
    router.push('/resources');
  };

  const handleClearAll = () => {
    setActiveResourceTypes([]);
    setActiveStatuses([]);
    setActiveFacilities([]);
    clearFilters();
  };

  return (
    <div className="min-h-screen w-full bg-[#F5F5F5] flex flex-col">
      {/* Navigation Header */}
      <header className="bg-white border-b-4 border-[#FF6B35]">
        <div className="max-w-full px-8 lg:px-12 py-5 flex items-center justify-between">
          <div className="flex flex-col">
            <h1 className="text-3xl font-heading font-black text-[#1A1A1A] tracking-tight">STEM COMMONS</h1>
            <p className="text-xs font-specifications text-[#666666] font-bold tracking-widest mt-1">DISCOVERY PLATFORM</p>
          </div>
          
          <div className="flex items-center gap-8">
            <a href="#" className="text-sm font-specifications font-bold text-[#1A1A1A] hover:text-[#FF6B35] transition uppercase">About</a>
            <a href="#" className="text-sm font-specifications font-bold text-[#1A1A1A] hover:text-[#FF6B35] transition uppercase">Contact</a>
            <Button 
              onClick={() => router.push('/submit')}
              size="md"
              className="px-6 py-2 font-bold"
            >
              SUBMIT
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 bg-white">
        <div className="max-w-5xl mx-auto px-8 py-24 space-y-20">
          {/* Hero Section */}
          <div className="text-center space-y-8">
            {/* Tag */}
            <div className="inline-block mx-auto px-4 py-2 border-2 border-[#FF6B35]">
              <p className="text-xs font-specifications font-bold text-[#FF6B35] tracking-widest">CONNECT • DISCOVER • INNOVATE</p>
            </div>

            {/* Headline */}
            <div className="space-y-4">
              <h2 className="text-7xl font-heading font-black text-[#1A1A1A] leading-tight">
                FIND YOUR<br/>
                <span className="text-[#FF6B35]">NEXT STEM SPACE</span>
              </h2>
            </div>

            {/* Subheading */}
            <p className="text-lg text-[#666666] max-w-2xl mx-auto font-specifications leading-relaxed">
              Connect with Makerspaces, ATAL Tinkering Labs, and STEM vendors across India.
            </p>
          </div>

          {/* Search Section */}
          <div className="space-y-6">
            {/* Search Header Bar */}
            <div className="bg-[#FF6B35] px-6 py-3">
              <p className="text-xs font-specifications font-bold text-white tracking-widest">SEARCH RESOURCES</p>
            </div>

            {/* Search Input with Button */}
            <div className="flex gap-0">
              <input
                type="text"
                placeholder="Search by name, city, or location..."
                className="flex-1 px-6 py-4 border-2 border-[#FF6B35] font-specifications text-[#1A1A1A] placeholder-[#999999] focus:outline-none bg-white"
              />
              <button className="bg-[#FF6B35] text-white px-8 py-4 font-heading font-bold text-sm hover:bg-[#E55A24] transition tracking-widest">
                SEARCH
              </button>
            </div>
          </div>

          {/* Browse Link */}
          <div className="text-center">
            <button 
              onClick={() => router.push('/resources')}
              className="text-sm font-specifications font-bold text-[#666666] hover:text-[#FF6B35] transition tracking-widest uppercase"
            >
              BROWSE ALL RESOURCES →
            </button>
          </div>

          {/* Statistics Section */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 bg-[#F5F5F5] p-8">
            <div className="text-center">
              <p className="text-4xl font-black text-[#FF6B35]">250+</p>
              <p className="text-xs font-specifications text-[#666666] tracking-widest mt-3">MAKERSPACES</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-black text-[#FF6B35]">1,200+</p>
              <p className="text-xs font-specifications text-[#666666] tracking-widest mt-3">ATAL LABS</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-black text-[#FF6B35]">85+</p>
              <p className="text-xs font-specifications text-[#666666] tracking-widest mt-3">VENDORS</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-black text-[#FF6B35]">28</p>
              <p className="text-xs font-specifications text-[#666666] tracking-widest mt-3">STATES</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#1A1A1A] text-white px-8 lg:px-12 py-6 border-t-4 border-[#FF6B35]">
        <div className="max-w-full flex justify-between items-center">
          <p className="text-xs font-specifications text-[#666666]">© 2026 STEM COMMONS. ALL RIGHTS RESERVED.</p>
          <div className="flex gap-8">
            <a href="#" className="text-xs font-specifications font-bold text-[#FF6B35] hover:text-white transition uppercase">About</a>
            <a href="#" className="text-xs font-specifications font-bold text-[#FF6B35] hover:text-white transition uppercase">Contact</a>
            <a href="#" className="text-xs font-specifications font-bold text-[#FF6B35] hover:text-white transition uppercase">Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
