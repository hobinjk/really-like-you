// Each node has successors: {word: number}

// Thanks stackoverflow and http://bl.ocks.org/mbostock/1153292
// (http://stackoverflow.com/questions/16568313/arrows-on-links-in-d3js-force-layout)

var root = {
  successors: {},
  word: '_'
};

var wordNodes = {};

var lyrics = 'I really wanna stop\nBut I just gotta taste for it\nI' +
' feel like I could fly with the ball on the moon\nSo honey hold my hand' +
' you like making me wait for it\nI feel I could die walking up to the' +
' room, oh yeah\nLate night watching television\nBut how we get in this' +
' position?\nIt\'s way too soon, I know this isn\'t love\nBut I need to' +
' tell you something\nI really really really really really really like' +
' you\nAnd I want you, do you want me, do you want me, too?\nI really' +
' really really really really really like you\nAnd I want you, do you' +
' want me, do you want me, too?\nOh, did I say too much?\nI\'m so in my' +
' head\nWhen we\'re out of touch\nI really really really really really' +
' really like you\nAnd I want you, do you want me, do you want me,' +
' too?\nIt\'s like everything you say is a sweet revelation\nAll I wanna' +
' do is get into your head\nYeah we could stay alone, you and me, and' +
' this temptation\nSipping on your lips, hanging on by thread,' +
' baby\nLate night watching television\nBut how we get in this' +
' position?\nIt\'s way too soon, I know this isn\'t love\nBut I need to' +
' tell you something\nI really really really really really really like' +
' you\nAnd I want you, do you want me, do you want me, too?\nI really' +
' really really really really really like you\nAnd I want you, do you' +
' want me, do you want me, too?\nOh, did I say too much?\nI\'m so in my' +
' head\nWhen we\'re out of touch\nI really really really really really' +
' really like you\nAnd I want you, do you want me, do you want me,' +
' too?\nWho gave you eyes like that?\nSaid you could keep them\nI don\'t' +
' know how to act\nThe way I should be leaving\nI\'m running out of' +
' time\nGoing out of my mind\nI need to tell you something\nYeah, I need' +
' to tell you something\nI really really really really really really' +
' like you\nAnd I want you, do you want me, do you want me, too?\nI' +
' really really really really really really like you\nAnd I want you, do' +
' you want me, do you want me, too?\nOh, did I say too much?\nI\'m so in' +
' my head\nWhen we\'re out of touch\nI really really really really' +
' really really like you\nAnd I want you, do you want me, do you want' +
' me, too?\nI really really really really really really like you\nAnd I' +
' want you, do you want me, do you want me, too?\nI really really really' +
' really really really like you\nAnd I want you, do you want me, do you' +
' want me, too?';
var links = {};
var wordsSet = {};

function linkKey(source, target) {
  return source + ' -> ' + target;
}

function addLink(source, target) {
  var key = linkKey(source, target);
  if (links[key]) {
    links[key].value += 1;
  } else {
    links[key] = {
      source: source,
      target: target,
      value: 1,
      bending: false
    };
  }

  var oppositeKey = linkKey(target, source);
  if (links[oppositeKey]) {
    links[key].bending = true;
    links[oppositeKey].bending = true;
  }
}

lyrics.split('\n').forEach(function(line) {
  var lastWord = null;
  line.split(' ').forEach(function(rawWord) {
    var word = rawWord.toLowerCase().replace(/[^a-z']/g, '');
    if (wordsSet[word]) {
      wordsSet[word].count += 1;
    } else {
      var nameWord = word;
      var potentialIMatch = nameWord.match(/^i('.+)?$/);
      if (potentialIMatch && (potentialIMatch[0].length === nameWord.length)) {
        nameWord = rawWord.replace(/[^A-Za-z']/g, '');
      }

      wordsSet[word] = {
        name: word,
        displayName: nameWord,
        count: 1
      };
    }

    if (lastWord) {
      addLink(lastWord, word);
    }

    lastWord = word;
  });
});

function values(set) {
  return Object.keys(set).map(function(key) {
    return set[key];
  });
}

var wordNodes = values(wordsSet);

var wordIndices = {};

wordNodes.forEach(function(word, index) {
  wordIndices[word.name] = index;
});

var wordLinks = values(links).map(function(link) {
  link.source = wordIndices[link.source];
  link.target = wordIndices[link.target];
  return link;
});

var width = window.innerWidth * 2;
var height = window.innerHeight * 2;
var padding = 0;

var force = d3.layout.force()
    .charge(-2000)
    .linkDistance(100)
    .size([width, height]);

var svg = d3.select('#markovia').append('svg')
    .attr('width', width - 2 * padding)
    .attr('height', height - 2 * padding)
  .append('g')
    .attr('transform', 'translate(' + padding + ',' + padding + ')');

svg.append('defs')
   .append('marker')
    .attr('id', 'arrow-head')
    .attr('viewBox', '0 -5 10 10')
    .attr('refX', 10)
    .attr('refY', 0)
    .attr('markerWidth', 6)
    .attr('markerHeight', 6)
    .attr('orient', 'auto')
  .append('path')
    .attr('d', 'M0,-5L10,0L0,5');

force.nodes(wordNodes)
     .links(wordLinks)
     .start();

var diagonal = d3.svg.diagonal();

var arrowPath = svg.append('g').selectAll('path')
    .data(force.links())
  .enter().append('path')
    .attr('class', 'link')
    .attr('marker-end', 'url(#arrow-head)')
    .attr('stroke-width', function(d) { return 1 + 0.5 * Math.sqrt(d.value); });

var node = svg.selectAll('.node')
    .data(wordNodes)
  .enter().append('g')
    .attr('class', 'node');

function circleRadius(d) {
  return 22 + 2 * Math.sqrt(d.count);
}

node.append('circle')
    .attr('r', circleRadius)
    .call(force.drag);

node.append('text')
    .attr('dy', '.31em')
    .attr('text-anchor', 'middle')
    .text(function(d) {return d.displayName; });

force.on('tick', function() {
  arrowPath.attr('d', linkArc);

  node.attr('transform', function(d) {
    return 'translate(' + d.x + ',' + d.y + ')';
  });
});

function linkArc(link) {
  var target = wordNodes[link.target.index];
  var source = wordNodes[link.source.index];

  if (link.source.name === link.target.name) {
    return drawSelfArc(target);
  }

  var targetRadius = circleRadius(target);
  var sourceRadius = circleRadius(source);

  var dx = target.x - source.x;
  var dy = target.y - source.y;

  var gamma = Math.atan2(dy, dx);

  var dr = Math.sqrt(dx * dx + dy * dy);

  var tx = target.x - Math.cos(gamma) * targetRadius;
  var ty = target.y - Math.sin(gamma) * targetRadius;

  var sx = source.x + Math.cos(gamma) * sourceRadius;
  var sy = source.y + Math.sin(gamma) * sourceRadius;

  if (link.bending) {
    var bendingDirection = bendingDirection = (dy / dx > 0) ? 1 : 0;
    return 'M' + sx + ',' + sy + 'A' + dr + ',' + dr + ' 0 0,' +
           bendingDirection + ' ' + tx + ',' + ty;
  } else {
    return 'M' + sx + ',' + sy + 'L' + tx + ',' + ty;
  }
}

function drawSelfArc(circle) {
  var x = circle.x;
  var y = circle.y;
  var r = circleRadius(circle);
  var upperAngle = -Math.PI / 3;
  var lowerAngle = upperAngle + Math.PI / 3;

  // Always draw self-loops in the top-right corner
  var sx = x + r * Math.cos(upperAngle);
  var sy = y + r * Math.sin(upperAngle);

  var tx = x + r * Math.cos(lowerAngle);
  var ty = y + r * Math.sin(lowerAngle);

  // Self-loops need a small section of line to point the arrowhead properly.
  // This constant is entirely empirical.
  var txInner = tx + Math.cos(2.7 * Math.PI / 3);
  var tyInner = ty + Math.sin(2.7 * Math.PI / 3);

  var dr = r / 1.5;

  return 'M' + sx + ',' + sy + 'A' + dr + ',' + dr + ' 0 1,1 ' + tx + ',' + ty +
         'L' + tx + ',' + ty + ' ' + txInner + ',' + tyInner;
}
