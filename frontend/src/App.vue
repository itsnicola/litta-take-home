<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { type CatalogueItem, loadCatalogue } from './services/catalogueService'

const navItems = ['Services', 'About', 'Contact']
const catalogueItems = ref<CatalogueItem[]>([])

onMounted(async () => {
  catalogueItems.value = await loadCatalogue()
})
</script>

<template>
  <div class="page-shell">
    <header class="site-header">
      <div class="brand-block">
        <span class="brand-mark">LT</span>
        <div>
          <p class="eyebrow">Litta</p>
          <p class="brand-name">Home Collection</p> <!-- TODO: replace with logo-->
        </div>
      </div>

      <nav class="site-nav" aria-label="Primary">
        <a
          v-for="item in navItems"
          :key="item"
          href="#"
        >
          {{ item }}
        </a>
      </nav>
    </header>

    <main class="hero-layout">
      <section class="hero-copy">
        <p class="hero-kicker">Book a fast, reliable collection</p>
        <h1>Clear your space without the back-and-forth.</h1>
        <p class="hero-text">
          A streamlined booking flow for waste collection, bulky item pickup, and
          home clearances. Choose a date, tell us what needs collecting, and we
          handle the rest.
        </p>

        <div class="hero-points">
          <div>
            <strong>Flexible slots</strong>
            <span>Morning and afternoon availability.</span>
          </div>
          <div>
            <strong>Simple pricing</strong>
            <span>Start with the essentials and refine later.</span>
          </div>
          <div>
            <strong>Quick confirmation</strong>
            <span>Designed to get a booking submitted in minutes.</span>
          </div>
        </div>
      </section>

      <section class="booking-card" aria-labelledby="booking-title">
        <div class="booking-card__header">
          <p class="card-label">Booking Form</p>
          <h2 id="booking-title">Request your collection</h2>
        </div>
<!-- 
        <p v-if="isLoadingCatalogue" class="booking-status">
          Loading catalogue items...
        </p> -->
        <!-- <p v-else-if="catalogueError" class="booking-status booking-status--error">
          {{ catalogueError }}
        </p> -->

        <form class="booking-form">
          <label> 
            <span>I need to get rid of a:</span>
            <select>
              <option selected disabled>Select an item type</option>
              <option
                v-for="item in catalogueItems"
                :key="item.id"
                :value="item.category"
              >
                {{ item.category }}
              </option>
            </select>
          </label>

          <label>
            <span>Postcode</span>
            <input type="text" placeholder="e.g. SW1A 1AA" />
          </label>

          <label>
            <span>Collection date</span>
            <input type="date" />
          </label>

          <label>
            <span>Service type</span>
            <select>
              <option selected disabled>Select a service</option>
              <option>Bulky waste collection</option>
              <option>House clearance</option>
              <option>Garden waste pickup</option>
            </select>
          </label>

          <label>
            <span>Items to collect</span>
            <textarea
              rows="4"
              placeholder="Sofa, mattress, broken shelving, black bags..."
            />
          </label>

          <button type="submit">Check availability</button>
        </form>
      </section>
    </main>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Fraunces:opsz,wght@9..144,600;9..144,700&display=swap');

:global(*) {
  box-sizing: border-box;
}

:global(body) {
  margin: 0;
  font-family: 'Manrope', sans-serif;
  background:
    radial-gradient(circle at top left, rgba(193, 225, 211, 0.55), transparent 28%),
    radial-gradient(circle at bottom right, rgba(242, 217, 187, 0.5), transparent 24%),
    linear-gradient(180deg, #f9f5ee 0%, #f3efe6 100%);
  color: #1f2a24;
}

:global(a) {
  color: inherit;
  text-decoration: none;
}

.page-shell {
  min-height: 100vh;
  padding: 28px;
}

.site-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  max-width: 1180px;
  margin: 0 auto 48px;
  padding: 18px 22px;
  border: 1px solid rgba(31, 42, 36, 0.08);
  border-radius: 999px;
  background: rgba(255, 252, 247, 0.74);
  backdrop-filter: blur(16px);
}

.brand-block {
  display: flex;
  align-items: center;
  gap: 14px;
}

.brand-mark {
  display: grid;
  width: 44px;
  height: 44px;
  place-items: center;
  border-radius: 50%;
  background: #1f2a24;
  color: #f8f4ed;
  font-weight: 800;
  letter-spacing: 0.08em;
}

.eyebrow,
.brand-name,
.card-label,
.hero-kicker {
  margin: 0;
}

.eyebrow,
.card-label,
.hero-kicker {
  color: #567465;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 0.72rem;
  font-weight: 700;
}

.brand-name {
  font-size: 0.95rem;
  font-weight: 700;
}

.site-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 22px;
  font-size: 0.95rem;
  color: #42564c;
}

.hero-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(320px, 460px);
  gap: 36px;
  align-items: center;
  max-width: 1180px;
  margin: 0 auto;
}

.hero-copy {
  padding: 28px 8px 28px 4px;
}

.hero-copy h1 {
  margin: 14px 0 18px;
  max-width: 10ch;
  font-family: 'Fraunces', serif;
  font-size: clamp(3.3rem, 8vw, 6rem);
  line-height: 0.92;
  letter-spacing: -0.06em;
}

.hero-text {
  max-width: 58ch;
  margin: 0 0 30px;
  font-size: 1.05rem;
  line-height: 1.7;
  color: #4f6358;
}

.hero-points {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.hero-points div {
  padding: 18px;
  border-radius: 24px;
  background: rgba(255, 252, 247, 0.65);
  border: 1px solid rgba(31, 42, 36, 0.08);
}

.hero-points strong,
.hero-points span {
  display: block;
}

.hero-points strong {
  margin-bottom: 8px;
  font-size: 0.95rem;
}

.hero-points span,
.booking-card__header p {
  color: #56695f;
  line-height: 1.6;
}

.booking-card {
  padding: 28px;
  border-radius: 32px;
  background: rgba(255, 253, 250, 0.88);
  border: 1px solid rgba(31, 42, 36, 0.08);
  box-shadow: 0 24px 80px rgba(60, 58, 38, 0.11);
}

.booking-card__header h2 {
  margin: 10px 0 10px;
  font-family: 'Fraunces', serif;
  font-size: 2rem;
  line-height: 1.05;
}

.booking-status {
  margin: 18px 0 0;
  color: #56695f;
  font-size: 0.95rem;
}

.booking-status--error {
  color: #8c3b2f;
}

.booking-form {
  display: grid;
  gap: 16px;
  margin-top: 24px;
}

.booking-form label {
  display: grid;
  gap: 8px;
}

.booking-form span {
  font-size: 0.9rem;
  font-weight: 700;
  color: #304138;
}

.booking-form input,
.booking-form select,
.booking-form textarea {
  width: 100%;
  border: 1px solid rgba(63, 82, 72, 0.14);
  border-radius: 18px;
  padding: 14px 16px;
  font: inherit;
  color: #1f2a24;
  background: #fffdfa;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.booking-form input:focus,
.booking-form select:focus,
.booking-form textarea:focus {
  outline: none;
  border-color: #6f8d7e;
  box-shadow: 0 0 0 4px rgba(111, 141, 126, 0.14);
}

.booking-form textarea {
  resize: vertical;
  min-height: 120px;
}

.booking-form button {
  margin-top: 8px;
  border: 0;
  border-radius: 999px;
  padding: 16px 20px;
  font: inherit;
  font-weight: 800;
  color: #f8f4ed;
  background: linear-gradient(135deg, #1f2a24 0%, #31473d 100%);
  cursor: pointer;
}

@media (max-width: 960px) {
  .site-header,
  .hero-layout {
    grid-template-columns: 1fr;
  }

  .site-header {
    border-radius: 32px;
    padding: 18px;
  }

  .hero-layout {
    gap: 24px;
  }

  .hero-points {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .page-shell {
    padding: 18px;
  }

  .site-header {
    align-items: flex-start;
  }

  .site-nav {
    gap: 14px;
  }

  .hero-copy h1 {
    max-width: none;
    font-size: clamp(2.8rem, 16vw, 4rem);
  }

  .booking-card {
    padding: 22px;
    border-radius: 24px;
  }
}
</style>
