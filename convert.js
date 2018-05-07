const fs = require('fs');
const path = require('path');

const dir = process.argv[2] || process.cwd();

const mkdir = d => !fs.existsSync(d) && fs.mkdirSync(d);

const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));

mkdir(path.join(dir, 'out'));

const sanitise = t => t.replace(/[^\w ]/g, '');

const pad2 = n => (n < 10 ? '0' : '') + n;
const dateString = d => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

files.forEach(f => {
	const base = f.replace(/\.json$/, '');
	mkdir(path.join(dir, 'out', base));
	const data = require(path.join(dir, f));
	console.log();
	console.log(base);
	console.log('════════════════════════');
	const l = data.entries.length;

	data.entries.forEach((entry, i) => {
		const [title, ...rest] = (entry.text || '').split('\n');
		const text = rest.join('\n');
		const name = sanitise(title);
		const date = new Date(entry.creationDate);
		console.log(`${i + 1}/${l}`, title);

		const location = entry.location
			? `${entry.location.placeName}

[![${entry.location.placeName}](https://maps.googleapis.com/maps/api/staticmap?center=${entry.location.latitude},${entry.location.longitude}&zoom=15&size=400x400&scale=2)](https://www.google.com/maps/embed/v1/search?key=AIzaSyBctFF2JCjitURssT91Am-_ZWMzRaYBm4Q&q=${entry.location.latitude},${entry.location.longitude})`
			: '';

		const tags = (entry.tags || []).map(
			tag => '#' + tag.split(/\W/g).map(
				word => word[0].toUpperCase() + word.slice(1).toLowerCase()
			).join('')
		).join(' ');

		fs.writeFileSync(
			path.join(dir, 'out', base, `${dateString(date)} ${name}.md`),
			`# ${title}

${text}

---

${location}

${tags}`,
			'utf8'
		);
	});
});
