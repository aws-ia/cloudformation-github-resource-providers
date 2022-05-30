export function isOctokitRequestError(ex: object) {
  return ex instanceof Object && ex.hasOwnProperty('status') && ex.hasOwnProperty('name');
}