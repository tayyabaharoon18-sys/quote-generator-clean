import { useEffect, useRef, useState } from 'react';
import './App.css';

function App() {
  // -------- STATE --------
  const [quote, setQuote] = useState('');
  const [author, setAuthor] = useState('');
  const [genre, setGenre] = useState('motivation');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showGenreMenu, setShowGenreMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  // Available genres the dropdown presents
  const genreOptions = [
    { value: 'motivation', label: 'Motivation' },
    { value: 'life', label: 'Life' },
    { value: 'success', label: 'Success' },
    { value: 'wisdom', label: 'Wisdom' }
  ];

  // Track the dropdown wrapper so we can detect clicks outside it
  const dropdownRef = useRef(null);
  const copyTimeoutRef = useRef(null);

  
  // -------- FETCH QUOTE FROM BACKEND --------
  const fetchQuote = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/quote?genre=${genre}`);

      if (!response.ok) {
        throw new Error('Backend error');
      }

      const data = await response.json();
      setQuote(data.quote);
      setAuthor(data.author);
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
        copyTimeoutRef.current = null;
      }
      setCopied(false);
    } catch (err) {
      setError('Failed to load quote from backend');
    } finally {
      setLoading(false);
    }
  };

  const handleGenreSelect = (value) => {
    setGenre(value);
    setShowGenreMenu(false);
  };

  const handleCopyQuote = async () => {
    if (!quote) {
      return;
    }

    const textToCopy = `"${quote}" — ${author}`;

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);

      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }

      copyTimeoutRef.current = setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (copyError) {
      // Silently fail to avoid overriding existing error messaging
    }
  };

  // Resolve the label for the currently selected genre
  const activeGenreLabel = genreOptions.find((option) => option.value === genre)?.label ?? 'Select Genre';

  // -------- LOAD QUOTE ON PAGE LOAD --------
  useEffect(() => {
    fetchQuote();
  }, []);

  // -------- LOAD NEW QUOTE WHEN GENRE CHANGES --------
  useEffect(() => {
    fetchQuote();
  }, [genre]);

  // Close dropdown when user clicks anywhere outside the control
  useEffect(() => {
    const handleClickAway = (event) => {
      if (!showGenreMenu) {
        return;
      }

      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowGenreMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickAway);

    return () => {
      document.removeEventListener('mousedown', handleClickAway);
    };
  }, [showGenreMenu]);

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  // -------- UI --------
  return (
    <div className="app-container">
      <div className="quote-card">
        <h1 className="quote-title">Quote Generator</h1>

        {/* GENRE DROPDOWN */}
        <div className="genre-control" ref={dropdownRef}>
          <label className="genre-label" htmlFor="genre-toggle">
            Select Genre
          </label>

          <button
            id="genre-toggle"
            type="button"
            className={`genre-toggle ${showGenreMenu ? 'open' : ''}`}
            onClick={() => setShowGenreMenu((prev) => !prev)}
            aria-haspopup="listbox"
            aria-expanded={showGenreMenu}
          >
            <span>{activeGenreLabel}</span>
            <span className="genre-chevron" aria-hidden="true" />
          </button>

          <ul
            className={`genre-list ${showGenreMenu ? 'visible' : ''}`}
            role="listbox"
            aria-activedescendant={`genre-${genre}`}
          >
            {genreOptions.map((option) => (
              <li key={option.value}>
                <button
                  type="button"
                  role="option"
                  id={`genre-${option.value}`}
                  className={`genre-option ${genre === option.value ? 'active' : ''}`}
                  aria-selected={genre === option.value}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => handleGenreSelect(option.value)}
                >
                  {option.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* LOADING STATE */}
        {loading && <p className="loading">Loading...</p>}

        {/* ERROR STATE */}
        {error && <p className="error">{error}</p>}

        {/* QUOTE DISPLAY */}
        {!loading && !error && (
          <>
            <p className="quote-text">"{quote}"</p>
            <p className="quote-author">— {author}</p>
          </>
        )}

        {/* ACTION BUTTONS */}
        <div className="quote-actions" style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
          <button
            className="new-quote-btn"
            onClick={fetchQuote}
            disabled={loading}
            style={{ marginTop: 0 }}
          >
            {loading ? 'Loading...' : 'New Quote'}
          </button>

          <button
            className="new-quote-btn"
            onClick={handleCopyQuote}
            disabled={loading || !quote}
            style={{ marginTop: 0 }}
          >
            {copied ? 'Copied!' : 'Copy Quote'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
