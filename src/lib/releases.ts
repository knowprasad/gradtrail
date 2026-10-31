// Where Dossier's releases are published, for the update check and its
// notice (update-check.ts, the sidebar). Safe to use in the browser.

export const RELEASES_REPOSITORY = "AienTech/dossier";
/** This fork's repository, opened from the sidebar's GitHub star link. */
export const REPOSITORY_URL = "https://github.com/knowprasad/gradtrail";
/** How to update Dossier, in its wiki. */
export const UPGRADE_GUIDE_URL = `https://github.com/${RELEASES_REPOSITORY}/wiki/Upgrading`;

/** A published release: its version, without the "v", and its page on GitHub. */
export type Release = { version: string; url: string };
