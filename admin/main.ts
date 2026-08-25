/**
 * Decap CMS admin, served at /admin.
 *
 * Bundled from npm rather than loaded from a CDN script tag (which is how the
 * Decap docs usually show it) so this site continues to make no third-party
 * requests from any page. The collections themselves are declared in
 * public/admin/config.yml, which Decap fetches at runtime — keeping it as data
 * means editing the content model doesn't require a rebuild.
 */
import CMS from 'decap-cms-app'

CMS.init()
