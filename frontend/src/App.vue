<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { BDropdown, BDropdownItemButton, BDropdownText } from 'bootstrap-vue-next'
import { getQuote, type BookingRequestResponse, type CatalogueItem, loadCatalogue, sendRequest as sendRequestService } from './services/catalogueService'

const navItems = ['Services', 'About', 'Contact']
const catalogueItems = ref<CatalogueItem[]>([])
const selectedItem = ref<CatalogueItem | null>(null)
const quantity = ref(1)
const postcode = ref('')
const customerName = ref('')
const customerEmail = ref('')
const quotedAmount = ref<number | null>(null)
const quoteLoading = ref(false)
const quoteError = ref('')
const requestSubmitting = ref(false)
const requestError = ref('')
const requestSuccess = ref<BookingRequestResponse | null>(null)
const currentStep = ref<'quote' | 'details' | 'success'>('quote')
let latestQuoteRequestId = 0

const groupedCatalogueItems = computed(() => {
  const groupedItems = new Map<string, CatalogueItem[]>()

  for (const item of catalogueItems.value) {
    const itemsInCategory = groupedItems.get(item.category) ?? []
    itemsInCategory.push(item)
    groupedItems.set(item.category, itemsInCategory)
  }

  return Array.from(groupedItems.entries()).map(([category, items]) => ({
    category,
    label: formatCategoryLabel(category),
    items: [...items].sort((left, right) => left.displayName.localeCompare(right.displayName)),
  }))
})

onMounted(async () => {
  catalogueItems.value = await loadCatalogue()
})

function formatCategoryLabel(category: string) {
  return category.charAt(0).toUpperCase() + category.slice(1)
}

watch([selectedItem, quantity, postcode], () => {
  void refreshQuote()
})

async function refreshQuote() {
  if (!validInputs.value) {
    quotedAmount.value = null
    quoteError.value = ''
    quoteLoading.value = false
    return
  }
  const item = selectedItem.value
  const trimmedPostcode = postcode.value.trim()
  const normalizedQuantity = Math.max(Number(quantity.value) || 1, 1)

  quantity.value = normalizedQuantity

  if (!item || !trimmedPostcode) {
    quotedAmount.value = null
    quoteError.value = ''
    quoteLoading.value = false
    return
  }

  const requestId = ++latestQuoteRequestId
  quoteLoading.value = true
  quoteError.value = ''

  // TODO: verify postcode before send!

  try {
    const nextQuote = await getQuote(item.id, normalizedQuantity, trimmedPostcode)

    if (requestId !== latestQuoteRequestId) {
      return
    }

    quotedAmount.value = nextQuote
  } catch (error) {
    if (requestId !== latestQuoteRequestId) {
      return
    }

    quotedAmount.value = null
    quoteError.value = error instanceof Error ? error.message : 'Unable to load quote.'
  } finally {
    if (requestId === latestQuoteRequestId) {
      quoteLoading.value = false
    }
  }
}

const estimatedQuote = computed(() => quotedAmount.value)
const hasLiveQuote = computed(() => quotedAmount.value !== null && !quoteLoading.value && !quoteError.value)
const isEmailValid = computed(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail.value.trim()))

const validInputs = computed(() => {
  if (!selectedItem.value) return false
  if (!postcode.value.trim()) return false // TODO: expand to valid postcodes
  return true
})

const canContinueToDetails = computed(() => validInputs.value && hasLiveQuote.value)
const requestDetailsValid = computed(() => customerName.value.trim().length > 1 && isEmailValid.value)

const quoteSummary = computed(() => {
  if (!selectedItem.value) return 'Choose an item and quantity to request a quote.'
  if (!postcode.value.trim()) return 'Enter a postcode to request a live quote.'
  if (quoteLoading.value) return 'Refreshing quote...'
  if (quoteError.value) return quoteError.value

  const itemLabel = quantity.value === 1 ? selectedItem.value.displayName : `${selectedItem.value.displayName}s`
  return `Live quote for ${quantity.value} ${itemLabel}`
})

const quoteHeading = computed(() => {
  if (currentStep.value === 'quote') return 'Tell us what needs to go.'
  if (currentStep.value === 'details') return 'Where should we send the request?'
  return 'Request received.'
})

const quoteDescription = computed(() =>
  currentStep.value === 'quote'
    ? 'Choose an item, set the quantity, and get an instant feel for the price.'
    : currentStep.value === 'details'
      ? 'Add your contact details so we can turn this quote into a collection request.'
      : 'Your collection request has been submitted. We’ll use these details to follow up.'
)

function goToDetailsStep() {
  if (!canContinueToDetails.value) return
  currentStep.value = 'details'
}

function returnToQuoteStep() {
  currentStep.value = 'quote'
}

async function sendRequest() {
  if (!selectedItem.value || !requestDetailsValid.value || requestSubmitting.value) {
    return
  }

  requestSubmitting.value = true
  requestError.value = ''

  try {
    requestSuccess.value = await sendRequestService(
      selectedItem.value.id,
      quantity.value,
      postcode.value.trim(),
      customerName.value.trim(),
      customerEmail.value.trim(),
    )
    currentStep.value = 'success'
  } catch (error) {
    requestError.value = error instanceof Error ? error.message : 'Unable to send your request.'
  } finally {
    requestSubmitting.value = false
  }
}
</script>

<template>
  <div class="page-shell">
    <header class="site-header">
      <div class="brand-block">
        <span class="brand-mark">LT</span>
        <div>
          <p class="eyebrow">Litta</p>
          <p class="brand-name">Home Collection</p>
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

    <main class="form-stage">
      <section class="quote-form-panel" aria-labelledby="quote-form-title">
        <div class="form-copy">
          <p class="section-kicker">Quick estimate</p>
          <h1 id="quote-form-title">{{ quoteHeading }}</h1>
          <p class="form-copy__text">{{ quoteDescription }}</p>
        </div>

        <div class="quote-form-layout">
          <Transition name="form-step" mode="out-in">
            <form
              v-if="currentStep === 'quote'"
              key="quote"
              class="quote-form"
            >
              <div class="field-group">
                <span class="field-label">What should we collect?</span>

                <div class="sentence-builder">
                  <div class="sentence-builder__text">I need to get rid of</div>
                  <div class="sentence-builder__inner">
                    <input
                      v-model.number="quantity"
                      class="quantity-input"
                      type="number"
                      min="1"
                      inputmode="numeric"
                    />

                    <BDropdown
                      id="item-dropdown"
                      variant="light"
                      boundary="viewport"
                      class="item-dropdown"
                      :text="selectedItem?.displayName ?? 'Select an item'"
                    >
                      <template
                        v-for="group in groupedCatalogueItems"
                        :key="group.category"
                      >
                        <BDropdownText class="item-dropdown__category">
                          {{ group.label }}
                        </BDropdownText>

                        <BDropdownItemButton
                          v-for="item in group.items"
                          :key="item.id"
                          @click="selectedItem = item"
                        >
                          {{ item.displayName }}
                        </BDropdownItemButton>
                      </template>
                    </BDropdown>
                  </div>
                </div>
              </div>

              <label class="field-group">
                <span class="field-label">Postcode</span>
                <input
                  v-model="postcode"
                  type="text"
                  placeholder="e.g. SW1A 1AA"
                />
              </label>
            </form>

            <form
              v-else-if="currentStep === 'details'"
              key="details"
              class="quote-form request-form"
            >
              <div class="request-intro">
                <span class="request-intro__eyebrow">Request details</span>
                <p>We’ll keep this quote and use these details to place your collection request.</p>
              </div>

              <label class="field-group">
                <span class="field-label">Your name</span>
                <input
                  v-model="customerName"
                  type="text"
                  placeholder="e.g. Alex Morgan"
                />
              </label>

              <label class="field-group">
                <span class="field-label">Email</span>
                <input
                  v-model="customerEmail"
                  type="email"
                  placeholder="e.g. alex@example.com"
                />
              </label>
            </form>

            <section
              v-else
              key="success"
              class="quote-form success-panel"
            >
              <span class="success-panel__eyebrow">Booking confirmed</span>
              <h2>We’ve created your collection request.</h2>
              <p>
                Your reference is
                <strong>{{ requestSuccess?.bookingReference }}</strong>.
                We’ll be in touch using <strong>{{ customerEmail.trim() }}</strong>.
              </p>

              <div class="success-panel__meta">
                <span class="success-panel__pill">{{ customerName.trim() }}</span>
                <span class="success-panel__pill">{{ postcode.trim() }}</span>
              </div>
            </section>
          </Transition>

          <div class="quote-panel" aria-live="polite">
            <span class="quote-panel__label">{{ currentStep === 'success' ? 'Request status' : 'Live quote' }}</span>
            <strong class="quote-panel__value">
              {{ estimatedQuote === null ? '—' : `£${estimatedQuote.toFixed(2)}` }}
            </strong>
            <p class="quote-panel__summary">
              {{ currentStep === 'success' ? `Request submitted with status ${requestSuccess?.status ?? 'PENDING'}.` : quoteSummary }}
            </p>

            <div
              v-if="currentStep !== 'quote' && selectedItem"
              class="quote-panel__meta"
            >
              <span class="quote-meta-pill">{{ quantity }} x {{ selectedItem.displayName }}</span>
              <span class="quote-meta-pill">{{ postcode.trim() }}</span>
            </div>

            <p
              v-if="requestError"
              class="quote-panel__error"
            >
              {{ requestError }}
            </p>

            <div class="quote-panel__footer">
              <button
                v-if="currentStep === 'quote'"
                type="button"
                :disabled="!canContinueToDetails"
                @click="goToDetailsStep"
              >
                Take it away!
              </button>

              <div
                v-else-if="currentStep === 'details'"
                class="quote-panel__actions"
              >
                <button
                  type="button"
                  class="button-secondary"
                  @click="returnToQuoteStep"
                >
                  Back to quote
                </button>
                <button
                  type="button"
                  :disabled="!requestDetailsValid || requestSubmitting"
                  @click="sendRequest"
                >
                  {{ requestSubmitting ? 'Sending request...' : 'Send collection request' }}
                </button>
              </div>

              <div
                v-else
                class="quote-panel__actions"
              >
                <button
                  type="button"
                  class="button-secondary"
                  @click="returnToQuoteStep"
                >
                  Create another quote
                </button>
              </div>
            </div>
          </div>
        </div>
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
    radial-gradient(circle at top left, rgba(123, 201, 255, 0.24), transparent 24%),
    radial-gradient(circle at top right, rgba(255, 209, 102, 0.18), transparent 22%),
    linear-gradient(180deg, #f7fbff 0%, #eef4f8 100%);
  color: #1f2a24;
}

.page-shell {
  min-height: 100vh;
  padding: 28px;
}

.eyebrow {
  margin: 0;
  color: #5d6f88;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 0.72rem;
  font-weight: 700;
}

.site-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  max-width: 1180px;
  margin: 0 auto 48px;
  padding: 6px 2px;
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
  border-radius: 14px;
  background: linear-gradient(135deg, #0f172a 0%, #2563eb 100%);
  color: #f8fbff;
  font-weight: 800;
  letter-spacing: 0.08em;
  box-shadow: 0 10px 24px rgba(37, 99, 235, 0.22);
}

.brand-name {
  margin: 2px 0 0;
  font-size: 0.95rem;
  font-weight: 700;
}

.site-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 22px;
  font-size: 0.95rem;
  color: #52637c;
}

.site-nav a {
  color: inherit;
  text-decoration: none;
  transition: color 0.2s ease;
}

.site-nav a:hover {
  color: #2563eb;
}

.form-stage {
  max-width: 1180px;
  margin: 0 auto;
}

.quote-form-panel {
  width: 100%;
  max-width: 1040px;
  margin: 0 auto;
  display: grid;
  gap: 22px;
  padding: 12px 0 0;
}

.quote-form-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.6fr) minmax(320px, 1fr);
  gap: 32px;
  align-items: start;
}

.section-kicker {
  margin: 0 0 12px;
  color: #2563eb;
  font-size: 0.82rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.form-copy h1 {
  margin: 0;
  font-family: 'Fraunces', serif;
  font-size: clamp(2.4rem, 5vw, 4.2rem);
  line-height: 0.94;
  letter-spacing: -0.06em;
  color: #132033;
}

.form-copy__text {
  margin: 16px 0 0;
  max-width: 40ch;
  color: #5e6f86;
  line-height: 1.6;
}

.quote-form {
  display: grid;
  gap: 22px;
}

.form-step-enter-active,
.form-step-leave-active {
  transition: opacity 0.32s ease, transform 0.32s ease;
}

.form-step-enter-from,
.form-step-leave-to {
  opacity: 0;
  transform: translateY(18px);
}

.request-form {
  align-content: start;
}

.request-intro {
  display: grid;
  gap: 10px;
  padding: 18px 18px 16px;
  border-radius: 20px;
  background: linear-gradient(180deg, rgba(37, 99, 235, 0.08) 0%, rgba(124, 201, 255, 0.12) 100%);
  color: #1f3352;
}

.request-intro p {
  margin: 0;
  line-height: 1.6;
}

.request-intro__eyebrow {
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #2563eb;
}

.success-panel {
  align-content: start;
  gap: 16px;
  padding: 28px;
  border-radius: 28px;
  background:
    radial-gradient(circle at top right, rgba(124, 201, 255, 0.28), transparent 38%),
    linear-gradient(180deg, #ffffff 0%, #eef6ff 100%);
  border: 1px solid rgba(37, 99, 235, 0.12);
  box-shadow: 0 24px 48px rgba(37, 99, 235, 0.08);
}

.success-panel h2,
.success-panel p {
  margin: 0;
}

.success-panel h2 {
  font-family: 'Fraunces', serif;
  font-size: clamp(1.9rem, 4vw, 2.8rem);
  line-height: 1;
  letter-spacing: -0.05em;
  color: #132033;
}

.success-panel p {
  color: #4f627c;
  line-height: 1.7;
}

.success-panel__eyebrow {
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #2563eb;
}

.success-panel__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.success-panel__pill {
  display: inline-flex;
  align-items: center;
  padding: 10px 14px;
  border-radius: 999px;
  background: rgba(37, 99, 235, 0.08);
  color: #1f3352;
  font-size: 0.85rem;
  font-weight: 700;
}

.field-group {
  display: grid;
  gap: 10px;
}

.field-label {
  font-size: 0.95rem;
  font-weight: 800;
  color: #304b78;
}

.sentence-builder {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 14px;
  border: 1px solid rgba(37, 99, 235, 0.12);
  border-radius: 20px;
  background: linear-gradient(180deg, #f9fbff 0%, #f2f7ff 100%);
}

.sentence-builder__text {
  font-size: 1.05rem;
  color: #1f3352;
  font-weight: 700;
}

.sentence-builder__inner {
  display: grid;
  grid-template-columns: 72px minmax(0, 1fr);
  gap: 10px;
  width: 100%;
  align-items: stretch;
}

.quote-form input,
.item-dropdown :deep(button.dropdown-toggle) {
  border: 1px solid rgba(37, 99, 235, 0.12);
  border-radius: 16px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
}

.quote-form input {
  width: 100%;
  padding: 14px 16px;
  font: inherit;
  color: #132033;
  background: #ffffff;
}

.quote-form input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.14);
  transform: translateY(-1px);
}

.quantity-input {
  width: 72px;
  min-width: 72px;
  max-width: 72px;
  text-align: center;
  font-size: 1rem;
  font-weight: 700;
  padding-inline: 10px;
}

.item-dropdown {
  width: 100%;
}

.item-dropdown :deep(button) {
  width: 100%;
  padding: 14px 16px;
  font: inherit;
  color: #132033;
  background: #ffffff;
  text-align: left;
}

.item-dropdown :deep(button.dropdown-toggle) {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.item-dropdown :deep(button.dropdown-toggle:focus) {
  border-color: #2563eb;
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.14);
}

.item-dropdown :deep(button.dropdown-toggle:hover) {
  transform: translateY(-1px);
}

.item-dropdown :deep(.item-dropdown__category) {
  padding: 12px 16px 6px;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #2563eb;
}

.quote-panel {
  padding: 24px;
  border-radius: 24px;
  background:
    radial-gradient(circle at top right, rgba(123, 201, 255, 0.26), transparent 38%),
    linear-gradient(180deg, #15243b 0%, #1d3557 100%);
  border: 1px solid rgba(19, 32, 51, 0.08);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.08),
    0 20px 40px rgba(19, 32, 51, 0.16);
}

.quote-panel__label,
.quote-panel__summary,
.quote-panel__note {
  color: rgba(231, 240, 255, 0.78);
}

.quote-panel__label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 0.78rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 7px 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
}

.quote-panel__label::before {
  content: '';
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #7cc9ff;
  box-shadow: 0 0 0 6px rgba(124, 201, 255, 0.14);
}

.quote-panel__value {
  display: block;
  font-family: 'Fraunces', serif;
  font-size: clamp(2rem, 4vw, 3rem);
  line-height: 1;
  letter-spacing: -0.05em;
  color: #ffffff;
}

.quote-panel__summary {
  margin: 10px 0 0;
  line-height: 1.5;
}

.quote-panel__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
}

.quote-meta-pill {
  display: inline-flex;
  align-items: center;
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  color: rgba(231, 240, 255, 0.9);
  font-size: 0.82rem;
  font-weight: 700;
}

.quote-panel__footer {
  display: flex;
  justify-content: center;
  margin-top: 22px;
}

.quote-panel__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
}

.quote-panel__error {
  margin: 14px 0 0;
  color: #ffd0d0;
  line-height: 1.5;
}

button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 64px;
  min-width: 200px;
  padding: 0 12px;
  border-radius: 999px;
  font-size: 0.82rem;
  font-weight: 800;
  color: #0f2747;
  background: #7cc9ff;
  border: none;
  transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease, color 0.2s ease;
}

button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 14px 28px rgba(124, 201, 255, 0.22);
}

button:disabled {
  color: #e7f0ff;
  background: rgba(255, 255, 255, 0.12);
  box-shadow: none;
}

.button-secondary {
  color: #e7f0ff;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
}

@media (max-width: 960px) {
  .site-header {
    margin-bottom: 36px;
  }

  .quote-form-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .page-shell {
    padding: 18px;
  }

  .site-header {
    align-items: flex-start;
    margin-bottom: 28px;
  }

  .form-copy h1 {
    font-size: clamp(2.2rem, 12vw, 3.3rem);
  }

  .quote-panel {
    padding: 20px;
  }

  .sentence-builder {
    align-items: stretch;
  }

  .sentence-builder__inner {
    grid-template-columns: 1fr;
  }

  .quantity-input {
    width: 100%;
    min-width: 0;
    max-width: none;
  }
}
</style>
