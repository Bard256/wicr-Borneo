function show(id, el) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-tab').forEach(a => a.classList.remove('active'));
  const target = document.getElementById(id);
  if (target) target.classList.add('active');
  if (el) el.classList.add('active');
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.nav-tab').forEach(link => {
    link.addEventListener('click', (e) => {
      const tabId = link.dataset.tab;
      if (document.getElementById(tabId)) {
        // 今いる画面にタブの中身がある場合は、ページ遷移せず切り替えだけ行う
        e.preventDefault();
        show(tabId, link);
        history.replaceState(null, '', '#' + tabId);
      }
      // 畑の予約・銀行など別ページの場合は、そのまま通常のリンク遷移をする
    });
  });

  // ホーム画面を #overview のような形で直接開いた場合、該当タブを表示する
  const hash = window.location.hash.replace('#', '');
  if (hash && document.getElementById(hash)) {
    const link = document.querySelector(`.nav-tab[data-tab="${hash}"]`);
    show(hash, link);
  }
});
