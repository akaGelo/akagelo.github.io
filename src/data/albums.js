export const albums = [
  {
    id: 'nature',
    title: 'Nature',
    description: 'Landscapes and wildlife',
    cover: '/images/albums/nature/cover.jpg',
    count: 6,
    size: 'large',
    story: 'These photos were taken during my weekend trip to the Carpathian Mountains. The early morning mist and golden hour light created perfect conditions for capturing the raw beauty of untouched nature. Each shot tells a story of serenity and the power of natural landscapes.',
    photos: [
      { id: 1, src: '/images/albums/nature/photo1.jpg', alt: 'Mountain lake' },
      { id: 2, src: '/images/albums/nature/photo2.jpg', alt: 'Forest road' },
      { id: 3, src: '/images/albums/nature/photo3.jpg', alt: 'Misty mountains' },
      { id: 4, src: '/images/albums/nature/photo4.jpg', alt: 'Green fields' },
      { id: 5, src: '/images/albums/nature/photo5.jpg', alt: 'Forest waterfall' }
    ]
  },
  {
    id: 'street',
    title: 'Street Photography',
    description: 'Urban moments',
    cover: '/images/albums/street/cover.jpg',
    count: 6,
    size: 'medium',
    photos: [
      { id: 1, src: '/images/albums/street/photo1.jpg', alt: 'City buildings' },
      { id: 2, src: '/images/albums/street/photo2.jpg', alt: 'Empty street at night' },
      { id: 3, src: '/images/albums/street/photo3.jpg', alt: 'People near buildings' },
      { id: 4, src: '/images/albums/street/photo4.jpg', alt: 'Narrow alley' },
      { id: 5, src: '/images/albums/street/photo5.jpg', alt: 'Urban cyclist' }
    ]
  },
  {
    id: 'portraits',
    title: 'Portraits',
    description: 'People and emotions',
    cover: '/images/albums/portraits/cover.jpg',
    count: 6,
    size: 'small',
    story: 'A collection of spontaneous portraits captured during various photography sessions. These images focus on genuine emotions and natural expressions, showing the unique character of each person. Shot with available light to maintain authenticity.',
    photos: [
      { id: 1, src: '/images/albums/portraits/photo1.jpg', alt: 'Male portrait' },
      { id: 2, src: '/images/albums/portraits/photo2.jpg', alt: 'Woman by wall' },
      { id: 3, src: '/images/albums/portraits/photo3.jpg', alt: 'Man in white shirt' },
      { id: 4, src: '/images/albums/portraits/photo4.jpg', alt: 'Smiling woman' },
      { id: 5, src: '/images/albums/portraits/photo5.jpg', alt: 'Black and white portrait' }
    ]
  },
  {
    id: 'landscapes',
    title: 'Landscapes',
    description: 'Beauty of natural landscapes',
    cover: '/images/albums/nature/photo1.jpg',
    count: 8,
    size: 'wide',
    photos: [
      { id: 1, src: '/images/albums/nature/photo1.jpg', alt: 'Mountain vista' },
      { id: 2, src: '/images/albums/nature/photo2.jpg', alt: 'Rolling hills' },
      { id: 3, src: '/images/albums/nature/photo3.jpg', alt: 'Valley view' },
      { id: 4, src: '/images/albums/nature/photo4.jpg', alt: 'Horizon line' },
      { id: 5, src: '/images/albums/nature/photo5.jpg', alt: 'Scenic overlook' }
    ]
  },
  {
    id: 'architecture',
    title: 'Architecture',
    description: 'Geometry of urban structures',
    cover: '/images/albums/street/photo2.jpg',
    count: 12,
    size: 'tall',
    photos: [
      { id: 1, src: '/images/albums/street/photo1.jpg', alt: 'Modern building facade' },
      { id: 2, src: '/images/albums/street/photo2.jpg', alt: 'Glass and steel' },
      { id: 3, src: '/images/albums/street/photo3.jpg', alt: 'Architectural details' },
      { id: 4, src: '/images/albums/street/photo4.jpg', alt: 'Urban geometry' },
      { id: 5, src: '/images/albums/street/photo5.jpg', alt: 'Building patterns' }
    ]
  },
  {
    id: 'people',
    title: 'People',
    description: 'Characters and emotions',
    cover: '/images/albums/portraits/photo2.jpg',
    count: 15,
    size: 'medium',
    photos: [
      { id: 1, src: '/images/albums/portraits/photo1.jpg', alt: 'Character study' },
      { id: 2, src: '/images/albums/portraits/photo2.jpg', alt: 'Natural expression' },
      { id: 3, src: '/images/albums/portraits/photo3.jpg', alt: 'Candid moment' },
      { id: 4, src: '/images/albums/portraits/photo4.jpg', alt: 'Emotional portrait' },
      { id: 5, src: '/images/albums/portraits/photo5.jpg', alt: 'Human connection' }
    ]
  },
  {
    id: 'sunset',
    title: 'Sunsets',
    description: 'Magic of golden hour',
    cover: '/images/albums/nature/photo3.jpg',
    count: 9,
    size: 'large',
    photos: [
      { id: 1, src: '/images/albums/nature/photo1.jpg', alt: 'Golden hour reflection' },
      { id: 2, src: '/images/albums/nature/photo2.jpg', alt: 'Evening light' },
      { id: 3, src: '/images/albums/nature/photo3.jpg', alt: 'Sunset silhouette' },
      { id: 4, src: '/images/albums/nature/photo4.jpg', alt: 'Warm glow' },
      { id: 5, src: '/images/albums/nature/photo5.jpg', alt: 'End of day' }
    ]
  },
  {
    id: 'urban',
    title: 'Urban',
    description: 'Rhythm of metropolis',
    cover: '/images/albums/street/photo4.jpg',
    count: 7,
    size: 'small',
    photos: [
      { id: 1, src: '/images/albums/street/photo1.jpg', alt: 'City rhythm' },
      { id: 2, src: '/images/albums/street/photo2.jpg', alt: 'Urban pulse' },
      { id: 3, src: '/images/albums/street/photo3.jpg', alt: 'Metropolitan life' },
      { id: 4, src: '/images/albums/street/photo4.jpg', alt: 'Street energy' },
      { id: 5, src: '/images/albums/street/photo5.jpg', alt: 'City dynamics' }
    ]
  },
  {
    id: 'studio',
    title: 'Studio',
    description: 'Controlled lighting',
    cover: '/images/albums/portraits/photo4.jpg',
    count: 11,
    size: 'wide',
    photos: [
      { id: 1, src: '/images/albums/portraits/photo1.jpg', alt: 'Studio setup' },
      { id: 2, src: '/images/albums/portraits/photo2.jpg', alt: 'Professional lighting' },
      { id: 3, src: '/images/albums/portraits/photo3.jpg', alt: 'Controlled environment' },
      { id: 4, src: '/images/albums/portraits/photo4.jpg', alt: 'Studio portrait' },
      { id: 5, src: '/images/albums/portraits/photo5.jpg', alt: 'Artistic lighting' }
    ]
  },
  {
    id: 'seasons',
    title: 'Seasons',
    description: 'Nature in motion',
    cover: '/images/albums/nature/photo5.jpg',
    count: 20,
    size: 'tall',
    photos: [
      { id: 1, src: '/images/albums/nature/photo1.jpg', alt: 'Spring awakening' },
      { id: 2, src: '/images/albums/nature/photo2.jpg', alt: 'Summer bloom' },
      { id: 3, src: '/images/albums/nature/photo3.jpg', alt: 'Autumn colors' },
      { id: 4, src: '/images/albums/nature/photo4.jpg', alt: 'Winter stillness' },
      { id: 5, src: '/images/albums/nature/photo5.jpg', alt: 'Seasonal change' }
    ]
  },
  {
    id: 'street-life',
    title: 'Street Life',
    description: 'Random moments',
    cover: '/images/albums/street/photo5.jpg',
    count: 14,
    size: 'medium',
    photos: [
      { id: 1, src: '/images/albums/street/photo1.jpg', alt: 'Street scene' },
      { id: 2, src: '/images/albums/street/photo2.jpg', alt: 'Daily life' },
      { id: 3, src: '/images/albums/street/photo3.jpg', alt: 'Urban stories' },
      { id: 4, src: '/images/albums/street/photo4.jpg', alt: 'Spontaneous moments' },
      { id: 5, src: '/images/albums/street/photo5.jpg', alt: 'Life in motion' }
    ]
  },
  {
    id: 'black-white',
    title: 'B&W Portraits',
    description: 'Classic without color',
    cover: '/images/albums/portraits/photo5.jpg',
    count: 6,
    size: 'small',
    photos: [
      { id: 1, src: '/images/albums/portraits/photo1.jpg', alt: 'Monochrome portrait' },
      { id: 2, src: '/images/albums/portraits/photo2.jpg', alt: 'Black and white study' },
      { id: 3, src: '/images/albums/portraits/photo3.jpg', alt: 'Classic portraiture' },
      { id: 4, src: '/images/albums/portraits/photo4.jpg', alt: 'Timeless elegance' },
      { id: 5, src: '/images/albums/portraits/photo5.jpg', alt: 'Dramatic lighting' }
    ]
  }
]; 