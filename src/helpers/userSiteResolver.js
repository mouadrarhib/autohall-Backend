// src/helpers/userSiteResolver.js
import { getUserById, getUserSiteById } from '../services/auth.service.js';
import { getGroupementById } from '../services/groupement.service.js';
import { getFilialeById } from '../services/filiale.service.js';
import { getSuccursaleById } from '../services/succursale.service.js';

export async function resolveUserSite({ userId, user }) {
  const baseUser = user ?? await getUserById(userId);
  if (!baseUser?.idUserSite) return null;

  const mapping = await getUserSiteById(baseUser.idUserSite);
  if (!mapping) return null;

  const groupement = await getGroupementById(mapping.idGroupement);
  if (!groupement) return { mapping, groupement: null, site: null };

  const siteFetcher = groupement.name?.toLowerCase() === 'filiale'
    ? getFilialeById
    : getSuccursaleById;

  const site = await siteFetcher(mapping.idSite);
  return { user: baseUser, mapping, groupement, site };
}
