const listings = [
  {
    name: 'Ravi Sharma',
    area: 'Mukherjee Nagar',
    rentPerDay: 90,
    deposit: 1200,
    duration: '7-30 days',
    phone: '98xxxx1201'
  },
  {
    name: 'Sana Khan',
    area: 'Laxmi Nagar',
    rentPerDay: 80,
    deposit: 1000,
    duration: '5-20 days',
    phone: '88xxxx3904'
  },
  {
    name: 'Pritam Das',
    area: 'Karol Bagh',
    rentPerDay: 110,
    deposit: 1500,
    duration: '15-60 days',
    phone: '97xxxx4512'
  },
  {
    name: 'Neha Verma',
    area: 'Mukherjee Nagar',
    rentPerDay: 75,
    deposit: 900,
    duration: '3-15 days',
    phone: '99xxxx8890'
  }
];

const listingsContainer = document.getElementById('listings');
const resultCount = document.getElementById('resultCount');
const searchForm = document.getElementById('searchForm');

function listingCardTemplate(item) {
  return `
    <article class="listing-card">
      <h3>${item.name}</h3>
      <div class="meta">
        <span>📍 ${item.area}</span>
        <span>💸 ₹${item.rentPerDay}/day</span>
        <span>🔐 ₹${item.deposit} deposit</span>
        <span>⏱ ${item.duration}</span>
        <span>📞 ${item.phone}</span>
      </div>
    </article>
  `;
}

function renderCards(data) {
  resultCount.textContent = `${data.length} nearby option${data.length === 1 ? '' : 's'} found`;

  if (!data.length) {
    listingsContainer.innerHTML =
      '<article class="listing-card">No matching listing found. Try nearby area name or increase budget.</article>';
    return;
  }

  listingsContainer.innerHTML = data.map((item) => listingCardTemplate(item)).join('');
}

function getFilteredListings() {
  const area = document.getElementById('areaInput').value.trim().toLowerCase();
  const budget = Number(document.getElementById('budgetInput').value || Number.MAX_SAFE_INTEGER);

  return listings.filter((item) => {
    const isAreaMatched = area ? item.area.toLowerCase().includes(area) : true;
    return isAreaMatched && item.rentPerDay <= budget;
  });
}

searchForm.addEventListener('submit', (event) => {
  event.preventDefault();
  renderCards(getFilteredListings());
});

renderCards(listings);