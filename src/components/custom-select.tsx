'use client';

import { useState, useRef, useEffect } from 'react';
import { Input } from './ui/input';

interface Option {
  id: string;
  key: string;
  name: string;
}

interface CustomSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function CustomSelect({ options, value, onChange, placeholder = 'Selecciona una opción' }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const selectRef = useRef<HTMLDivElement>(null);

  const filteredOptions = options.filter(option =>
    option.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    option.key.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const selectedOption = options.find(opt => opt.key === value);

  return (
    <div className="relative" ref={selectRef}>
      <div
        className="flex h-10 w-[300px] items-center justify-between rounded-md border border-input bg-gray-700 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedOption ? `${selectedOption.name} (${selectedOption.key})` : placeholder}
      </div>

      {isOpen && (
        <div className="absolute z-50 w-[300px] rounded-md border bg-black text-white shadow-md">
          <div className="p-2">
            <Input
              ref={inputRef}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar..."
              className="mb-2"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div className="max-h-[300px] overflow-y-auto">
            {filteredOptions.map((option) => (
              <div
                key={option.id}
                className="cursor-pointer px-4 py-2 hover:bg-zinc-800"
                onClick={() => {
                  onChange(option.key);
                  setIsOpen(false);
                  setSearchTerm('');
                }}
              >
                {option.name} ({option.key})
              </div>
            ))}
            {filteredOptions.length === 0 && (
              <div className="p-2 text-sm text-zinc-400">
                No se encontraron resultados
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 