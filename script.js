// script.js
/*******************************************
 * 1) SELECTORS & DATA
 *******************************************/
const promptInput = document.getElementById('prompt-input');
const allLinks = document.querySelectorAll('.category ul li a');
const categories = document.querySelectorAll('.category');

/*******************************************
 * 2) CONFIGURATION VARIABLES
 *******************************************/
// These variables are defined in the HTML's script tag

/*******************************************
 * 3) AUTO-FOCUS the prompt on load
 *******************************************/
window.addEventListener('DOMContentLoaded', () => {
  promptInput.focus();

  // Handle link click target based on configuration
  if (!openClicksInNewTab) {
    allLinks.forEach(link => {
      link.removeAttribute('target');
    });
  }
});

/*******************************************
 * 4) REAL-TIME DIM & HIGHLIGHT
 *******************************************/
function updateHighlightAndDim(query) {
  // If no query => remove all dims and highlights
  if (!query) {
    // Remove .dim from all categories
    categories.forEach(cat => cat.classList.remove('dim'));
    // Remove .highlight, .dim, and .active-highlight from all links
    allLinks.forEach(link => {
      link.classList.remove('highlight');
      link.classList.remove('dim');
      link.classList.remove('active-highlight'); // Remove active highlight
    });
    // Reset cycling data
    promptInput.dataset.matches = '';
    promptInput.dataset.cycleIndex = -1;
    return;
  }

  // Convert query to lowercase for case-insensitive matching
  const lower = query.toLowerCase();

  // Collect all matching links
  const matches = [];

  // Highlight links that start with the query and dim others
  allLinks.forEach(link => {
    const text = link.textContent.trim().toLowerCase();
    if (text.startsWith(lower)) {
      link.classList.add('highlight');
      link.classList.remove('dim');
      matches.push(link);
    } else {
      link.classList.remove('highlight');
      link.classList.add('dim');
      link.classList.remove('active-highlight'); // Remove active highlight
    }
  });

  // Dim category headings if none of their links are highlighted
  categories.forEach(cat => {
    const linksInCat = cat.querySelectorAll('ul li a');
    // Check if any link in the category is highlighted
    const anyMatch = Array.from(linksInCat).some(
      l => l.classList.contains('highlight')
    );
    if (anyMatch) {
      cat.classList.remove('dim');
    } else {
      cat.classList.add('dim');
    }
  });

  // Store the matches in the prompt input's dataset for cycling
  promptInput.dataset.matches = matches.map(link => link.textContent.trim()).join(',');
  promptInput.dataset.cycleIndex = -1; // Reset cycle index
}

// Event listener for input changes to update highlights and dims
promptInput.addEventListener('input', () => {
  updateHighlightAndDim(promptInput.value.trim());
});

/*******************************************
 * 5) TAB => CYCLE THROUGH MATCHES
 *******************************************/
promptInput.addEventListener('keydown', e => {
  if (e.key === 'Tab') {
    e.preventDefault(); // Prevent losing focus

    const matches = promptInput.dataset.matches ? promptInput.dataset.matches.split(',') : [];
    if (matches.length === 0) return; // No matches to cycle

    // Update cycle index
    let cycleIndex = parseInt(promptInput.dataset.cycleIndex) || -1;
    cycleIndex = (cycleIndex + 1) % matches.length;
    promptInput.dataset.cycleIndex = cycleIndex;

    // Set the input value to the current match
    promptInput.value = matches[cycleIndex];
    updateHighlightAndDim(promptInput.value.trim());

    // Highlight the active match
    highlightActiveMatch(cycleIndex);
  }
});

/*******************************************
 * 6) ENTER => DIRECT NAVIGATION OR SEARCH
 *******************************************/
promptInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    e.preventDefault();
    const query = promptInput.value.trim();
    if (query) {
      const lowerQuery = query.toLowerCase();
      const matchedLink = linkMap[lowerQuery];
      if (matchedLink) {
        if (openSearchInNewTab) {
          window.open(matchedLink, '_blank');
        } else {
          window.location.href = matchedLink;
        }
      } else {
        const searchURL = "https://www.google.com/search?q=" + encodeURIComponent(query);
        if (openSearchInNewTab) {
          window.open(searchURL, '_blank');
        } else {
          window.location.href = searchURL;
        }
      }
    }
  }
});

/*******************************************
 * 7) KEYBOARD BUTTON CLICK => AUTO-FOCUS SEARCH
 *******************************************/
document.addEventListener('keydown', (e) => {
  // Ignore modifier keys
  const ignoredKeys = ['Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'Tab', 'Escape'];
  if (ignoredKeys.includes(e.key)) return;

  // If the search input is not focused, focus it
  if (document.activeElement !== promptInput) {
    e.preventDefault(); // Prevent default action if necessary
    promptInput.focus();
    // Insert the pressed key into the input
    // Handle special keys (like Backspace, etc.) if needed
    // For simplicity, we'll only handle printable characters
    if (e.key.length === 1) { // Printable characters have length 1
      promptInput.value += e.key;
      updateHighlightAndDim(promptInput.value.trim());
    }
  }
});

/*******************************************
 * 8) CLICKING EMPTY BACKGROUND => RESET SEARCH
 *******************************************/
document.addEventListener('click', (e) => {
  // Check if the click was outside the content-wrapper and prompt
  const contentWrapper = document.querySelector('.content-wrapper');
  const prompt = document.querySelector('.prompt');

  if (!contentWrapper.contains(e.target)) {
    // Clicked outside the content-wrapper
    resetSearch();
    return;
  }

  // Alternatively, check if the click was specifically on the background
  if (!prompt.contains(e.target) && !e.target.closest('.category')) {
    resetSearch();
  }
});

function resetSearch() {
  promptInput.value = '';
  updateHighlightAndDim('');
}

/*******************************************
 * 9) CREATE LINK MAP FOR AUTOCOMPLETE AND NAVIGATION
 *******************************************/
const linkMap = {};
allLinks.forEach(link => {
  const title = link.textContent.trim().toLowerCase();
  const href = link.href;
  linkMap[title] = href;
});

/*******************************************
 * 10) HIGHLIGHT ACTIVE MATCH
 *******************************************/
function highlightActiveMatch(index) {
  // Remove existing active highlights
  allLinks.forEach(link => {
    link.classList.remove('active-highlight');
  });

  // Find the link with the current match
  const currentMatch = promptInput.value.trim().toLowerCase();
  const activeLink = Array.from(allLinks).find(link => link.textContent.trim().toLowerCase() === currentMatch);

  if (activeLink) {
    activeLink.classList.add('active-highlight');
  }
}
