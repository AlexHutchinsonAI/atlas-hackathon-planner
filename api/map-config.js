/* Only a publishable Mapbox key is returned. Secret-token prefixes are never exposed. */
module.exports = (req,res) => {
  const token=process.env.MAPBOX_PUBLIC_TOKEN || '';
  res.setHeader('Cache-Control','no-store');
  if(!token.startsWith('pk.'))return res.status(503).json({error:'Map configuration unavailable'});
  return res.status(200).json({token});
};
