self.addEventListener('notificationclick', event => {
 event.notification.close();
 event.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(async windows => {
  const existing=windows.find(w=>new URL(w.url).origin===self.location.origin);
  if(existing)await existing.focus();else await clients.openWindow('/');
 }));
});
