import {
  getActiveHero,
  getAnnouncement,
  getHeroSlides,
} from "@/lib/contentStore";
import {
  activateHeroAction,
  createHeroAction,
  deleteHeroAction,
  updateAnnouncementAction,
  updateHeroAction,
} from "./actions";

export const dynamic = "force-dynamic";

type HomepageSearchParams = Promise<
  Record<string, string | string[] | undefined>
>;

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AdminHomepagePage({
  searchParams,
}: {
  searchParams: HomepageSearchParams;
}) {
  const params = await searchParams;
  const saved = firstValue(params.saved);
  const error = firstValue(params.error);

  const announcement = getAnnouncement();
  const slides = getHeroSlides();
  const activeHero = getActiveHero();

  return (
    <div className="admin-homepage">
      <header className="admin-page-head">
        <p className="admin-eyebrow">Storefront</p>
        <h1 className="admin-page-title">Homepage</h1>
        <p className="admin-page-note">
          The announcement bar and hero slide publish to the storefront as soon as
          they are saved. Only one hero slide can be active at a time.
        </p>
      </header>

      {saved ? (
        <p
          className="admin-flash"
          data-flash="saved"
          data-testid="admin-flash"
          role="status"
        >
          {saved}
        </p>
      ) : null}

      {error ? (
        <p
          className="admin-flash admin-flash--error"
          data-flash="error"
          data-testid="admin-flash"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      <div className="admin-two-column">
        <section
          className="admin-homepage__section"
          aria-labelledby="announcement-heading"
        >
          <h2 className="admin-section-title" id="announcement-heading">
            Announcement Bar
          </h2>
          <p className="admin-page-note">
            A short message shown above the storefront header. Links must point to a
            page on this site.
          </p>

          <form
            className="admin-form admin-homepage__form"
            action={updateAnnouncementAction}
            data-testid="announcement-form"
            noValidate
          >
            <div className="admin-field">
              <label className="admin-field__label" htmlFor="announcement-label">
                Label
              </label>
              <input
                className="admin-field__input"
                id="announcement-label"
                name="announcement-label"
                type="text"
                defaultValue={announcement.label}
                data-testid="announcement-label"
                required
              />
            </div>

            <div className="admin-field">
              <label className="admin-field__label" htmlFor="announcement-href">
                Link
              </label>
              <input
                className="admin-field__input"
                id="announcement-href"
                name="announcement-href"
                type="text"
                defaultValue={announcement.href}
                data-testid="announcement-href"
                required
              />
              <p className="admin-field__hint">Local path, for example /pages/legal.</p>
            </div>

            <label className="admin-check" htmlFor="announcement-enabled">
              <input
                id="announcement-enabled"
                name="announcement-enabled"
                type="checkbox"
                value="1"
                defaultChecked={announcement.enabled}
                data-testid="announcement-enabled"
              />
              Show announcement bar
            </label>

            <div className="admin-form__actions">
              <button
                className="button-solid"
                type="submit"
                data-testid="announcement-submit"
              >
                Save Announcement
              </button>
            </div>
          </form>
        </section>

        <section className="admin-homepage__section" aria-labelledby="hero-create-heading">
          <h2 className="admin-section-title" id="hero-create-heading">
            Create Hero Slide
          </h2>
          <p className="admin-page-note">
            Upload a JPEG, PNG, or WebP image up to 5MB. The slide is appended to the
            end of the slideshow.
          </p>

          <form
            className="admin-form admin-homepage__form"
            action={createHeroAction}
            data-testid="hero-create-form"
            noValidate
          >
            <div className="admin-field">
              <label className="admin-field__label" htmlFor="hero-create-image">
                Image
              </label>
              <input
                className="admin-field__input admin-homepage__file"
                id="hero-create-image"
                name="hero-create-image"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                data-testid="hero-create-image"
                required
              />
            </div>

            <div className="admin-field">
              <label className="admin-field__label" htmlFor="hero-create-href">
                Link
              </label>
              <input
                className="admin-field__input"
                id="hero-create-href"
                name="hero-create-href"
                type="text"
                placeholder="/collections/new-arrivals"
                data-testid="hero-create-href"
                required
              />
              <p className="admin-field__hint">Local path, for example /collections/tees.</p>
            </div>

            <div className="admin-field">
              <label className="admin-field__label" htmlFor="hero-create-alt">
                Title / Alt Text
              </label>
              <input
                className="admin-field__input"
                id="hero-create-alt"
                name="hero-create-alt"
                type="text"
                placeholder="Stüssy Holiday 2026 campaign"
                data-testid="hero-create-alt"
                required
              />
            </div>

            <label className="admin-check" htmlFor="hero-create-active">
              <input
                id="hero-create-active"
                name="hero-create-active"
                type="checkbox"
                value="1"
                data-testid="hero-create-active"
              />
              Make this the active slide
            </label>

            <div className="admin-form__actions">
              <button
                className="button-solid"
                type="submit"
                data-testid="hero-create-submit"
              >
                Create Slide
              </button>
            </div>
          </form>
        </section>
      </div>

      <section className="admin-section" aria-labelledby="hero-slides-heading">
        <h2 className="admin-section-title" id="hero-slides-heading">
          Hero Slides
        </h2>
        <p className="admin-page-note" data-testid="hero-active-summary">
          {activeHero
            ? `Slide ${activeHero.id} is currently live on the storefront.`
            : "No slide is active. The storefront is showing its fallback hero."}
        </p>

        {slides.length === 0 ? (
          <p className="admin-homepage__empty">No hero slides have been created yet.</p>
        ) : (
          <ul className="admin-list admin-homepage__list" data-testid="hero-slide-list">
            {slides.map((slide) => {
              const isActive = activeHero?.id === slide.id;

              return (
                <li
                  className="admin-list__row hero-slide-row"
                  key={slide.id}
                  data-testid="hero-slide-row"
                  data-hero-id={slide.id}
                  data-active={isActive ? "true" : "false"}
                >
                  <div className="admin-media-preview hero-slide-row__preview">
                    <img src={slide.image} alt={slide.alt} />
                  </div>

                  <div className="hero-slide-row__details">
                    <p className="admin-list__title">
                      Slide {slide.id}
                      {isActive ? (
                        <span
                          className="hero-slide-row__active"
                          data-testid="hero-active-marker"
                        >
                          Active
                        </span>
                      ) : null}
                    </p>
                    <p className="admin-list__meta">{slide.href}</p>
                    <p className="admin-list__meta">{slide.alt}</p>
                    <p className="admin-list__meta">{slide.image}</p>
                  </div>

                  <form
                    className="admin-form hero-slide-row__form"
                    action={updateHeroAction.bind(null, slide.id)}
                    data-testid={`hero-update-form-${slide.id}`}
                    noValidate
                  >
                    <input type="hidden" name="currentImage" value={slide.image} />

                    <div className="admin-field">
                      <label
                        className="admin-field__label"
                        htmlFor={`hero-image-${slide.id}`}
                      >
                        Replace Image (optional)
                      </label>
                      <input
                        className="admin-field__input admin-homepage__file"
                        id={`hero-image-${slide.id}`}
                        name={`hero-image-${slide.id}`}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        data-testid={`hero-image-${slide.id}`}
                      />
                    </div>

                    <div className="admin-field">
                      <label
                        className="admin-field__label"
                        htmlFor={`hero-href-${slide.id}`}
                      >
                        Link
                      </label>
                      <input
                        className="admin-field__input"
                        id={`hero-href-${slide.id}`}
                        name={`hero-href-${slide.id}`}
                        type="text"
                        defaultValue={slide.href}
                        data-testid={`hero-href-${slide.id}`}
                        required
                      />
                    </div>

                    <div className="admin-field">
                      <label
                        className="admin-field__label"
                        htmlFor={`hero-alt-${slide.id}`}
                      >
                        Title / Alt Text
                      </label>
                      <input
                        className="admin-field__input"
                        id={`hero-alt-${slide.id}`}
                        name={`hero-alt-${slide.id}`}
                        type="text"
                        defaultValue={slide.alt}
                        data-testid={`hero-alt-${slide.id}`}
                        required
                      />
                    </div>

                    <label
                      className="admin-check"
                      htmlFor={`hero-active-${slide.id}`}
                      title="The active slide stays live until another slide is activated."
                    >
                      <input
                        id={`hero-active-${slide.id}`}
                        name={`hero-active-${slide.id}`}
                        type="checkbox"
                        value="1"
                        defaultChecked={isActive}
                        data-testid={`hero-active-${slide.id}`}
                      />
                      Active slide
                    </label>

                    <div className="admin-form__actions">
                      <button
                        className="button-outline"
                        type="submit"
                        data-testid={`hero-save-${slide.id}`}
                      >
                        Save Slide
                      </button>
                    </div>
                  </form>

                  <div className="hero-slide-row__actions">
                    <form action={activateHeroAction.bind(null, slide.id)}>
                      <button
                        className="button-outline"
                        type="submit"
                        disabled={isActive}
                        data-testid={`hero-activate-${slide.id}`}
                      >
                        Activate
                      </button>
                    </form>
                    <form action={deleteHeroAction.bind(null, slide.id)}>
                      <button
                        className="admin-link-button admin-danger hero-slide-row__delete"
                        type="submit"
                        data-testid={`hero-delete-${slide.id}`}
                      >
                        Delete
                      </button>
                    </form>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
