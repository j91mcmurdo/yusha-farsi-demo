
"use client";

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Category, Tag } from '@/lib/types';
import { Search, X } from 'lucide-react';
import { Button } from './ui/button';

interface FilterControlsProps {
  categories: Category[];
  tags: Tag[];
}

export default function FilterControls({ categories, tags }: FilterControlsProps) {
  const searchParams = useSearchParams();
  const { replace } = useRouter();
  const pathname = usePathname();

  const handleFilterChange = (key: 'q' | 'category' | 'tag', value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    replace(`${pathname}?${params.toString()}`);
  };

  const handleSearch = useDebouncedCallback((term: string) => {
    handleFilterChange('q', term);
  }, 300);

  const clearFilters = () => {
    replace(pathname);
  };

  const hasActiveFilters = searchParams.get('q') || searchParams.get('category') || searchParams.get('tag');

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 rounded-lg bg-card border">
      <div className="relative md:col-span-2">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search by English, Finglish, or Farsi..."
          className="pl-10"
          defaultValue={searchParams.get('q')?.toString()}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>

      <Select
        onValueChange={(value) => handleFilterChange('category', value === 'all' ? '' : value)}
        defaultValue={searchParams.get('category') || 'all'}
      >
        <SelectTrigger>
          <SelectValue placeholder="Filter by category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          {categories.map((cat) => (
            <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        onValueChange={(value) => handleFilterChange('tag', value === 'all' ? '' : value)}
        defaultValue={searchParams.get('tag') || 'all'}
      >
        <SelectTrigger>
          <SelectValue placeholder="Filter by tag" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Tags</SelectItem>
          {tags.map((tag) => (
            <SelectItem key={tag.id} value={tag.id}>{tag.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {hasActiveFilters && (
         <div className="md:col-start-4 flex justify-end">
            <Button variant="ghost" onClick={clearFilters}>
              <X className="mr-2 h-4 w-4" />
              Clear Filters
            </Button>
          </div>
      )}
    </div>
  );
}
