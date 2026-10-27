export const DEFAULT_PAGINATION = Object.freeze({
  PAGE: 1,
  LIMIT: 10,
  SORT_BY: "createdAt",
  SORT_ORDER: "desc",
});

export const ALLOWED_SORT_FIELDS = [
  "firstName",
  "lastName",
  "email",
  "phone",
  "type",
  "travelToCountry",
  "member",
  "groupMember",
  "timeToRevertBack",
  "createdAt",
  "updatedAt",
];

export default {
  DEFAULT_PAGINATION,
  ALLOWED_SORT_FIELDS,
};
