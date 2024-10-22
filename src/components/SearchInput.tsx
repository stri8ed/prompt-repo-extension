import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faXmark } from "@fortawesome/free-solid-svg-icons";

type SearchInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
};

const SearchInput = ({
   value,
   onChange,
   placeholder = 'Search...',
   className = ''
 }: SearchInputProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value) {
      setIsExpanded(true);
    }
  }, []);

  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node) &&
        !value
      ) {
        setIsExpanded(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [value]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      setIsExpanded(false);
      onChange('');
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onChange('');
    inputRef.current?.focus();
  };

  const handleClick = (e: React.MouseEvent) => {
    if (!isExpanded) {
      setIsExpanded(true);
    }
  };

  return (
    <div
      className={`relative ${className}`}
      ref={containerRef}
      onClick={handleClick}
      area-label="Search Input"
    >
      <div
        className={`
          flex items-center
          transition-all duration-300 ease-in-out
          rounded-full
          ${isExpanded ? 'w-64 bg-gray-100' : 'w-8 cursor-pointer '}
        `}
      >
        <FontAwesomeIcon
          icon={faMagnifyingGlass}
          className={`
            text-gray-400
            hover:text-gray-900
            ml-3 w-4 h-4
          `}
        />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}

          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`
            bg-transparent
            border-none
            outline-none
            focus:outline-none
            focus:ring-0
            transition-all duration-300
            text-sm
            ${isExpanded
            ? 'w-full px-3 py-2 opacity-100'
            : 'w-0 px-0 opacity-0'
          }
          `}
          style={{ cursor: isExpanded ? 'text' : 'pointer' }}
        />
        {isExpanded && value && (
          <button
            onClick={handleClear}
            className="mr-2 p-1.5 cursor-pointer text-white rounded-full bg-gray-400 hover:bg-gray-500 transition-colors flex-shrink-0 h-4 w-4 flex items-center justify-center"
          >
            <FontAwesomeIcon icon={faXmark} className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchInput;