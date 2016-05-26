
module.exports = {
  title: $ => $('h1').first().text(),
  date: $ => $('time[datetime]').attr('datetime'),
  excerpt: $ => $('p').first().text(),
}
