const natural = require('natural');
const compromise = require('compromise');

class TextProcessor {
  constructor() {
    // Initialize tokenizer and stemmer
    this.tokenizer = new natural.WordTokenizer();
    this.stemmer = natural.PorterStemmer;
    
    // Educational keywords for different categories
    this.educationalKeywords = {
      mathematics: {
        geometry: ['triangle', 'square', 'circle', 'rectangle', 'polygon', 'angle', 'side', 'vertex', 'area', 'perimeter'],
        algebra: ['equation', 'variable', 'solve', 'function', 'graph', 'plot', 'linear', 'quadratic', 'polynomial'],
        calculus: ['derivative', 'integral', 'limit', 'slope', 'curve', 'tangent', 'rate of change'],
        theorem: ['pythagorean', 'theorem', 'proof', 'formula', 'identity', 'property']
      },
      physics: {
        mechanics: ['velocity', 'acceleration', 'force', 'momentum', 'energy', 'motion', 'gravity'],
        waves: ['wave', 'frequency', 'amplitude', 'wavelength', 'interference', 'oscillation'],
        vectors: ['vector', 'magnitude', 'direction', 'addition', 'subtraction', 'component']
      },
      algorithmic: {
        sorting: ['sort', 'bubble sort', 'quick sort', 'merge sort', 'heap sort', 'insertion sort'],
        searching: ['search', 'binary search', 'linear search', 'find', 'lookup'],
        dataStructures: ['array', 'list', 'stack', 'queue', 'tree', 'graph', 'heap']
      },
      scientific: {
        chemistry: ['molecule', 'atom', 'bond', 'reaction', 'element', 'compound'],
        biology: ['cell', 'organism', 'evolution', 'genetics', 'protein', 'dna'],
        general: ['process', 'cycle', 'system', 'structure', 'function']
      }
    };

    // Animation action keywords
    this.actionKeywords = {
      display: ['show', 'display', 'draw', 'create', 'generate', 'make'],
      animate: ['animate', 'move', 'transition', 'transform', 'morph', 'change'],
      highlight: ['highlight', 'emphasize', 'focus', 'point out', 'indicate'],
      label: ['label', 'name', 'title', 'caption', 'annotate'],
      demonstrate: ['demonstrate', 'explain', 'illustrate', 'visualize', 'show how']
    };
  }

  // Main function to parse educational text
  async parseEducationalText(description, preferredStyle = 'general') {
    try {
      console.log(`🔍 Processing text: "${description.substring(0, 100)}..."`);
      
      // Clean and normalize text
      const cleanText = this.cleanText(description);
      
      // Basic NLP processing
      const doc = compromise(cleanText);
      const tokens = this.tokenizer.tokenize(cleanText.toLowerCase());
      
      // Analyze the text
      const analysis = {
        originalText: description,
        cleanText: cleanText,
        tokens: tokens,
        
        // Extract key components
        subjects: this.extractSubjects(doc),
        actions: this.extractActions(tokens),
        objects: this.extractObjects(doc),
        properties: this.extractProperties(doc),
        
        // Classify educational category
        category: this.classifyEducationalCategory(tokens, preferredStyle),
        
        // Extract numerical values and measurements
        numbers: this.extractNumbers(doc),
        
        // Determine animation style
        animationType: this.determineAnimationType(tokens),
        
        // Extract temporal information
        timing: this.extractTiming(doc),
        
        // Educational concept detection
        concepts: this.detectEducationalConcepts(tokens)
      };

      console.log(`✅ Analysis complete: Category=${analysis.category}, Concepts=${analysis.concepts.length}`);
      return analysis;

    } catch (error) {
      console.error('Error in text processing:', error);
      throw new Error(`Text processing failed: ${error.message}`);
    }
  }

  // Clean and normalize input text
  cleanText(text) {
    return text
      .trim()
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/[^\w\s.,;:!?()-]/g, '') // Remove special characters except basic punctuation
      .toLowerCase();
  }

  // Extract main subjects from the text
  extractSubjects(doc) {
    const nouns = doc.nouns().out('array');
    const subjects = [];
    
    // Look for educational subjects
    nouns.forEach(noun => {
      if (this.isEducationalSubject(noun)) {
        subjects.push({
          term: noun,
          type: 'subject',
          confidence: 0.8
        });
      }
    });

    return subjects;
  }

  // Extract action words that indicate animation types
  extractActions(tokens) {
    const actions = [];
    
    tokens.forEach(token => {
      Object.keys(this.actionKeywords).forEach(actionType => {
        if (this.actionKeywords[actionType].includes(token)) {
          actions.push({
            term: token,
            type: actionType,
            confidence: 0.9
          });
        }
      });
    });

    return actions;
  }

  // Extract objects to be animated
  extractObjects(doc) {
    const objects = [];
    
    // Extract nouns that could be visual objects
    const nouns = doc.nouns().out('array');
    const visualObjects = ['triangle', 'square', 'circle', 'line', 'arrow', 'bar', 'graph', 'point', 'vector', 'molecule'];
    
    nouns.forEach(noun => {
      if (visualObjects.some(obj => noun.includes(obj))) {
        objects.push({
          term: noun,
          type: 'visual_object',
          confidence: 0.7
        });
      }
    });

    return objects;
  }

  // Extract properties and attributes
  extractProperties(doc) {
    const properties = [];
    
    // Look for adjectives that describe visual properties
    const adjectives = doc.adjectives().out('array');
    const visualAdjectives = ['red', 'blue', 'green', 'large', 'small', 'moving', 'static', 'colored', 'labeled'];
    
    adjectives.forEach(adj => {
      if (visualAdjectives.includes(adj)) {
        properties.push({
          term: adj,
          type: 'visual_property',
          confidence: 0.6
        });
      }
    });

    return properties;
  }

  // Classify the educational category
  classifyEducationalCategory(tokens, preferredStyle) {
    const scores = {
      mathematical: 0,
      physics: 0,
      algorithmic: 0,
      scientific: 0,
      general: 0
    };

    // Score based on keyword matches
    tokens.forEach(token => {
      Object.keys(this.educationalKeywords).forEach(category => {
        Object.values(this.educationalKeywords[category]).forEach(keywords => {
          if (keywords.includes(token)) {
            scores[category] += 1;
          }
        });
      });
    });

    // Apply preference bonus
    if (preferredStyle !== 'general' && scores[preferredStyle] > 0) {
      scores[preferredStyle] += 2;
    }

    // Find category with highest score
    const bestCategory = Object.keys(scores).reduce((a, b) => 
      scores[a] > scores[b] ? a : b
    );

    return scores[bestCategory] > 0 ? bestCategory : 'general';
  }

  // Extract numerical values
  extractNumbers(doc) {
    const numbers = doc.values().out('array');
    const numericalData = [];

    numbers.forEach(num => {
      const parsed = parseFloat(num);
      if (!isNaN(parsed)) {
        numericalData.push({
          value: parsed,
          original: num,
          type: 'number'
        });
      }
    });

    return numericalData;
  }

  // Determine animation type based on content
  determineAnimationType(tokens) {
    const animationTypes = {
      'step-by-step': ['step', 'steps', 'process', 'sequence', 'algorithm'],
      'transformation': ['transform', 'change', 'morph', 'become', 'convert'],
      'motion': ['move', 'motion', 'velocity', 'acceleration', 'path'],
      'growth': ['grow', 'expand', 'increase', 'enlarge', 'scale'],
      'construction': ['build', 'construct', 'create', 'draw', 'make']
    };

    let bestType = 'static';
    let maxScore = 0;

    Object.keys(animationTypes).forEach(type => {
      let score = 0;
      tokens.forEach(token => {
        if (animationTypes[type].includes(token)) {
          score += 1;
        }
      });

      if (score > maxScore) {
        maxScore = score;
        bestType = type;
      }
    });

    return maxScore > 0 ? bestType : 'static';
  }

  // Extract timing information
  extractTiming(doc) {
    const timeWords = ['first', 'then', 'next', 'finally', 'simultaneously', 'after', 'before'];
    const text = doc.out('text');
    
    const timing = {
      hasSequence: timeWords.some(word => text.includes(word)),
      isSimultaneous: text.includes('simultaneously') || text.includes('at the same time'),
      hasSteps: text.includes('step') || text.includes('stage')
    };

    return timing;
  }

  // Detect specific educational concepts
  detectEducationalConcepts(tokens) {
    const concepts = [];

    // Mathematical concepts
    if (tokens.some(t => ['pythagorean', 'theorem'].every(w => tokens.includes(w)))) {
      concepts.push({
        name: 'Pythagorean Theorem',
        category: 'mathematics',
        type: 'theorem',
        confidence: 0.9
      });
    }

    if (tokens.includes('vector') && tokens.some(t => ['addition', 'add', 'sum'].includes(t))) {
      concepts.push({
        name: 'Vector Addition',
        category: 'physics',
        type: 'operation',
        confidence: 0.8
      });
    }

    // Algorithm concepts
    if (tokens.includes('bubble') && tokens.includes('sort')) {
      concepts.push({
        name: 'Bubble Sort',
        category: 'algorithmic',
        type: 'sorting_algorithm',
        confidence: 0.9
      });
    }

    if (tokens.includes('sine') || tokens.includes('sin')) {
      concepts.push({
        name: 'Sine Wave',
        category: 'mathematics',
        type: 'function',
        confidence: 0.8
      });
    }

    return concepts;
  }

  // Check if a term is an educational subject
  isEducationalSubject(term) {
    const subjects = [
      'mathematics', 'physics', 'chemistry', 'biology',
      'geometry', 'algebra', 'calculus', 'trigonometry',
      'algorithm', 'programming', 'computer science'
    ];
    
    return subjects.some(subject => 
      term.includes(subject) || subject.includes(term)
    );
  }

  // Get animation suggestions based on analysis
  getAnimationSuggestions(analysis) {
    const suggestions = [];

    // Based on category
    switch (analysis.category) {
      case 'mathematical':
        suggestions.push('Use coordinate system', 'Show step-by-step calculations', 'Highlight geometric shapes');
        break;
      case 'physics':
        suggestions.push('Use vector arrows', 'Show force diagrams', 'Animate motion paths');
        break;
      case 'algorithmic':
        suggestions.push('Use colored bars for sorting', 'Show step-by-step execution', 'Highlight comparisons');
        break;
      case 'scientific':
        suggestions.push('Use molecular models', 'Show process flow', 'Use scientific notation');
        break;
    }

    // Based on concepts
    analysis.concepts.forEach(concept => {
      switch (concept.name) {
        case 'Pythagorean Theorem':
          suggestions.push('Draw right triangle', 'Show squares on each side', 'Animate area calculation');
          break;
        case 'Vector Addition':
          suggestions.push('Draw coordinate axes', 'Use colored arrows', 'Show parallelogram method');
          break;
        case 'Bubble Sort':
          suggestions.push('Use array of bars', 'Highlight comparisons in red', 'Animate swaps');
          break;
      }
    });

    return [...new Set(suggestions)]; // Remove duplicates
  }
}

module.exports = new TextProcessor();