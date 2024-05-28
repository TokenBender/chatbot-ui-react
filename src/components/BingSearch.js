import React, { useState } from 'react';

function BingSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  const handleSearch = () => {
    fetch('http://127.0.0.1:5001/bing-search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data.results)) {
          setResults(data.results);
        } else {
          console.error('Unexpected response format:', data);
          alert('An error occurred while fetching search results. Please try again later.');
        }
      })
      .catch((error) => {
        console.error('Error fetching search results:', error);
        alert('An error occurred while fetching search results. Please try again later.');
      });
  };

  return (
    <div className="bing-search">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search the web..."
      />
      <button onClick={handleSearch}>Search</button>
      <div className="search-results">
        {results.map((result, index) => (
          <div key={index} className="search-result">
            <a href={result.url} target="_blank" rel="noopener noreferrer">
              <h3>{result.name}</h3>
            </a>
            <p>{result.snippet}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default BingSearch;
