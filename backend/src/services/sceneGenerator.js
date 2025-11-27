const { v4: uuidv4 } = require('uuid');

class SceneGenerator {
  constructor() {
    // Animation templates for different educational concepts
    this.templates = {
      'Pythagorean Theorem': this.pythagoreanTemplate,
      'Vector Addition': this.vectorAdditionTemplate,
      'Bubble Sort': this.bubbleSortTemplate,
      'Sine Wave': this.sineWaveTemplate
    };

    // Default animation settings
    this.defaultSettings = {
      fps: 30,
      backgroundColor: '#ffffff',
      dimensions: { width: 1920, height: 1080 },
      padding: 100
    };
  }

  // Main function to generate scenes from parsed text
  async generateScenes(parsedData, totalDuration = 10) {
    try {
      console.log(`🎬 Generating scenes for category: ${parsedData.category}`);
      
      const scenes = [];
      
      // Check if we have a specific template for the detected concept
      const concept = parsedData.concepts.find(c => this.templates[c.name]);
      
      if (concept && this.templates[concept.name]) {
        console.log(`📋 Using template for: ${concept.name}`);
        return await this.templates[concept.name].call(this, parsedData, totalDuration);
      }

      // Generate generic scenes based on category
      return await this.generateGenericScenes(parsedData, totalDuration);

    } catch (error) {
      console.error('Error generating scenes:', error);
      throw new Error(`Scene generation failed: ${error.message}`);
    }
  }

  // Create animation instructions from scenes
  async createInstructions(scenes, style) {
    const instructions = {
      metadata: {
        version: '1.0',
        style: style,
        totalDuration: scenes.reduce((total, scene) => total + scene.duration, 0),
        sceneCount: scenes.length,
        ...this.defaultSettings
      },
      timeline: [],
      objects: {},
      animations: []
    };

    let currentTime = 0;

    scenes.forEach((scene, index) => {
      // Add scene to timeline
      instructions.timeline.push({
        sceneId: scene.id,
        startTime: currentTime,
        endTime: currentTime + scene.duration,
        title: scene.title
      });

      // Add scene objects to global objects collection
      scene.objects.forEach(obj => {
        instructions.objects[obj.id] = {
          ...obj,
          sceneId: scene.id
        };

        // Convert object animations to global animation instructions
        obj.animations.forEach(anim => {
          instructions.animations.push({
            id: uuidv4(),
            objectId: obj.id,
            sceneId: scene.id,
            startTime: currentTime + (anim.delay || 0),
            duration: anim.duration,
            property: anim.property,
            fromValue: anim.from,
            toValue: anim.to,
            easing: anim.easing || 'ease-in-out'
          });
        });
      });

      currentTime += scene.duration;
    });

    console.log(`📝 Generated instructions: ${instructions.animations.length} animations, ${Object.keys(instructions.objects).length} objects`);
    return instructions;
  }

  // Template for Pythagorean Theorem animation
  async pythagoreanTemplate(parsedData, totalDuration) {
    const scenes = [];
    const sceneDuration = totalDuration / 4;

    // Extract triangle dimensions from parsed data or use defaults
    const a = parsedData.numbers.length > 0 ? parsedData.numbers[0].value : 3;
    const b = parsedData.numbers.length > 1 ? parsedData.numbers[1].value : 4;
    const c = Math.sqrt(a * a + b * b);

    // Scene 1: Draw the right triangle
    scenes.push({
      id: uuidv4(),
      title: 'Draw Right Triangle',
      duration: sceneDuration,
      startTime: 0,
      objects: [
        {
          id: 'triangle',
          type: 'shape',
          properties: {
            shape: 'path',
            points: [[400, 400], [400 + a * 60, 400], [400, 400 - b * 60]],
            stroke: '#2E3440',
            strokeWidth: 3,
            fill: 'transparent'
          },
          animations: [{
            property: 'opacity',
            from: 0,
            to: 1,
            duration: sceneDuration,
            easing: 'ease-in'
          }]
        },
        {
          id: 'label_a',
          type: 'text',
          properties: {
            text: `a = ${a}`,
            x: 350,
            y: 420,
            fontSize: 24,
            color: '#D08770'
          },
          animations: [{
            property: 'opacity',
            from: 0,
            to: 1,
            duration: sceneDuration * 0.5,
            delay: sceneDuration * 0.5
          }]
        },
        {
          id: 'label_b',
          type: 'text',
          properties: {
            text: `b = ${b}`,
            x: 380,
            y: 320,
            fontSize: 24,
            color: '#A3BE8C'
          },
          animations: [{
            property: 'opacity',
            from: 0,
            to: 1,
            duration: sceneDuration * 0.5,
            delay: sceneDuration * 0.5
          }]
        }
      ],
      metadata: {
        backgroundColor: '#ECEFF4'
      }
    });

    // Scene 2: Show square on side 'a'
    scenes.push({
      id: uuidv4(),
      title: 'Square on Side A',
      duration: sceneDuration,
      startTime: sceneDuration,
      objects: [
        {
          id: 'square_a',
          type: 'shape',
          properties: {
            shape: 'rectangle',
            x: 400 - a * 60,
            y: 400,
            width: a * 60,
            height: a * 60,
            fill: '#D08770',
            fillOpacity: 0.3,
            stroke: '#D08770',
            strokeWidth: 2
          },
          animations: [{
            property: 'scale',
            from: 0,
            to: 1,
            duration: sceneDuration,
            easing: 'bounce-out'
          }]
        },
        {
          id: 'area_a',
          type: 'text',
          properties: {
            text: `Area = ${a}² = ${a * a}`,
            x: 400 - a * 30,
            y: 400 + a * 30,
            fontSize: 18,
            color: '#D08770',
            textAlign: 'center'
          },
          animations: [{
            property: 'opacity',
            from: 0,
            to: 1,
            duration: sceneDuration * 0.5,
            delay: sceneDuration * 0.5
          }]
        }
      ]
    });

    // Scene 3: Show square on side 'b'
    scenes.push({
      id: uuidv4(),
      title: 'Square on Side B',
      duration: sceneDuration,
      startTime: sceneDuration * 2,
      objects: [
        {
          id: 'square_b',
          type: 'shape',
          properties: {
            shape: 'rectangle',
            x: 400,
            y: 400 - b * 60 - b * 60,
            width: b * 60,
            height: b * 60,
            fill: '#A3BE8C',
            fillOpacity: 0.3,
            stroke: '#A3BE8C',
            strokeWidth: 2
          },
          animations: [{
            property: 'scale',
            from: 0,
            to: 1,
            duration: sceneDuration,
            easing: 'bounce-out'
          }]
        },
        {
          id: 'area_b',
          type: 'text',
          properties: {
            text: `Area = ${b}² = ${b * b}`,
            x: 400 + b * 30,
            y: 400 - b * 30 - b * 60,
            fontSize: 18,
            color: '#A3BE8C',
            textAlign: 'center'
          },
          animations: [{
            property: 'opacity',
            from: 0,
            to: 1,
            duration: sceneDuration * 0.5,
            delay: sceneDuration * 0.5
          }]
        }
      ]
    });

    // Scene 4: Show final equation
    scenes.push({
      id: uuidv4(),
      title: 'Pythagorean Equation',
      duration: sceneDuration,
      startTime: sceneDuration * 3,
      objects: [
        {
          id: 'equation',
          type: 'text',
          properties: {
            text: `a² + b² = c²`,
            x: 960,
            y: 200,
            fontSize: 36,
            color: '#2E3440',
            textAlign: 'center',
            fontWeight: 'bold'
          },
          animations: [{
            property: 'opacity',
            from: 0,
            to: 1,
            duration: sceneDuration * 0.3
          }]
        },
        {
          id: 'calculation',
          type: 'text',
          properties: {
            text: `${a}² + ${b}² = ${c.toFixed(1)}²`,
            x: 960,
            y: 260,
            fontSize: 28,
            color: '#5E81AC',
            textAlign: 'center'
          },
          animations: [{
            property: 'opacity',
            from: 0,
            to: 1,
            duration: sceneDuration * 0.3,
            delay: sceneDuration * 0.3
          }]
        },
        {
          id: 'result',
          type: 'text',
          properties: {
            text: `${a * a} + ${b * b} = ${(c * c).toFixed(1)}`,
            x: 960,
            y: 320,
            fontSize: 28,
            color: '#BF616A',
            textAlign: 'center'
          },
          animations: [{
            property: 'opacity',
            from: 0,
            to: 1,
            duration: sceneDuration * 0.3,
            delay: sceneDuration * 0.6
          }]
        }
      ]
    });

    return scenes;
  }

  // Template for Vector Addition animation
  async vectorAdditionTemplate(parsedData, totalDuration) {
    const scenes = [];
    const sceneDuration = totalDuration / 5;

    // Scene 1: Create coordinate system
    scenes.push({
      id: uuidv4(),
      title: 'Coordinate System',
      duration: sceneDuration,
      startTime: 0,
      objects: [
        {
          id: 'x_axis',
          type: 'line',
          properties: {
            x1: 200, y1: 540,
            x2: 1720, y2: 540,
            stroke: '#4C566A',
            strokeWidth: 2
          },
          animations: [{
            property: 'strokeDashoffset',
            from: 1520,
            to: 0,
            duration: sceneDuration * 0.5
          }]
        },
        {
          id: 'y_axis',
          type: 'line',
          properties: {
            x1: 960, y1: 100,
            x2: 960, y2: 980,
            stroke: '#4C566A',
            strokeWidth: 2
          },
          animations: [{
            property: 'strokeDashoffset',
            from: 880,
            to: 0,
            duration: sceneDuration * 0.5,
            delay: sceneDuration * 0.25
          }]
        },
        {
          id: 'origin',
          type: 'text',
          properties: {
            text: 'O (0,0)',
            x: 940,
            y: 560,
            fontSize: 20,
            color: '#4C566A'
          },
          animations: [{
            property: 'opacity',
            from: 0,
            to: 1,
            duration: sceneDuration * 0.3,
            delay: sceneDuration * 0.7
          }]
        }
      ]
    });

    // Continue with vector scenes...
    return scenes;
  }

  // Template for Bubble Sort animation
  async bubbleSortTemplate(parsedData, totalDuration) {
    const scenes = [];
    const array = [64, 34, 25, 12, 22, 11, 90]; // Default array
    const sceneDuration = totalDuration / array.length;

    // Scene 1: Show initial array
    scenes.push({
      id: uuidv4(),
      title: 'Initial Array',
      duration: sceneDuration,
      startTime: 0,
      objects: array.map((value, index) => ({
        id: `bar_${index}`,
        type: 'shape',
        properties: {
          shape: 'rectangle',
          x: 300 + index * 120,
          y: 540 - value * 4,
          width: 80,
          height: value * 4,
          fill: '#5E81AC',
          stroke: '#2E3440',
          strokeWidth: 2
        },
        animations: [{
          property: 'opacity',
          from: 0,
          to: 1,
          duration: sceneDuration,
          delay: index * 0.1
        }]
      })).concat(array.map((value, index) => ({
        id: `label_${index}`,
        type: 'text',
        properties: {
          text: value.toString(),
          x: 340 + index * 120,
          y: 560,
          fontSize: 18,
          color: '#2E3440',
          textAlign: 'center'
        },
        animations: [{
          property: 'opacity',
          from: 0,
          to: 1,
          duration: sceneDuration,
          delay: index * 0.1 + 0.5
        }]
      })))
    });

    return scenes;
  }

  // Template for Sine Wave animation
  async sineWaveTemplate(parsedData, totalDuration) {
    const scenes = [];
    // Implementation for sine wave...
    return scenes;
  }

  // Generate generic scenes for unknown concepts
  async generateGenericScenes(parsedData, totalDuration) {
    const scenes = [];
    
    // Create a simple scene based on the category
    switch (parsedData.category) {
      case 'mathematical':
        return await this.generateMathScenes(parsedData, totalDuration);
      case 'physics':
        return await this.generatePhysicsScenes(parsedData, totalDuration);
      case 'algorithmic':
        return await this.generateAlgorithmScenes(parsedData, totalDuration);
      default:
        return await this.generateDefaultScenes(parsedData, totalDuration);
    }
  }

  // Generate default math scenes
  async generateMathScenes(parsedData, totalDuration) {
    return [{
      id: uuidv4(),
      title: 'Mathematical Concept',
      duration: totalDuration,
      startTime: 0,
      objects: [{
        id: 'title',
        type: 'text',
        properties: {
          text: 'Mathematical Visualization',
          x: 960,
          y: 200,
          fontSize: 48,
          color: '#2E3440',
          textAlign: 'center'
        },
        animations: [{
          property: 'opacity',
          from: 0,
          to: 1,
          duration: 2
        }]
      }]
    }];
  }

  // Generate default physics scenes
  async generatePhysicsScenes(parsedData, totalDuration) {
    return [{
      id: uuidv4(),
      title: 'Physics Concept',
      duration: totalDuration,
      startTime: 0,
      objects: [{
        id: 'title',
        type: 'text',
        properties: {
          text: 'Physics Visualization',
          x: 960,
          y: 200,
          fontSize: 48,
          color: '#2E3440',
          textAlign: 'center'
        },
        animations: [{
          property: 'opacity',
          from: 0,
          to: 1,
          duration: 2
        }]
      }]
    }];
  }

  // Generate default algorithm scenes
  async generateAlgorithmScenes(parsedData, totalDuration) {
    return [{
      id: uuidv4(),
      title: 'Algorithm Visualization',
      duration: totalDuration,
      startTime: 0,
      objects: [{
        id: 'title',
        type: 'text',
        properties: {
          text: 'Algorithm Demonstration',
          x: 960,
          y: 200,
          fontSize: 48,
          color: '#2E3440',
          textAlign: 'center'
        },
        animations: [{
          property: 'opacity',
          from: 0,
          to: 1,
          duration: 2
        }]
      }]
    }];
  }

  // Generate default scenes for unknown categories
  async generateDefaultScenes(parsedData, totalDuration) {
    return [{
      id: uuidv4(),
      title: 'Educational Concept',
      duration: totalDuration,
      startTime: 0,
      objects: [{
        id: 'title',
        type: 'text',
        properties: {
          text: 'Educational Visualization',
          x: 960,
          y: 200,
          fontSize: 48,
          color: '#2E3440',
          textAlign: 'center'
        },
        animations: [{
          property: 'opacity',
          from: 0,
          to: 1,
          duration: 2
        }]
      }]
    }];
  }
}

module.exports = new SceneGenerator();