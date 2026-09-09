fetch('evidence/rag-evaluation.json')
  .then((response) => response.ok ? response.json() : Promise.reject(new Error('evidence unavailable')))
  .then((data) => {
    const metrics = [
      ['44', '条已批准 Golden Set'],
      [`${(data.metrics.recallAt5 * 100).toFixed(0)}%`, 'Recall@5'],
      [`${(data.metrics.sourceHitRate * 100).toFixed(0)}%`, 'Expected source hit'],
      [data.metrics.mrr.toFixed(3), 'MRR'],
      [`${(data.metrics.citationValidity * 100).toFixed(0)}%`, 'Citation validity'],
    ];
    document.querySelector('#metrics').innerHTML = metrics.map(([value, label]) => `<div class="metric"><b>${value}</b><span>${label}</span></div>`).join('');
  })
  .catch(() => { document.querySelector('#metrics').textContent = '公开评测汇总暂不可用。'; });
