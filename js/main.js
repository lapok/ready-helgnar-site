document.addEventListener('DOMContentLoaded', () => {
  const header = document.getElementById('siteHeader');
  const aboutSection = document.getElementById('about');
  let isSticky = false;

  function handleScroll() {
    const aboutWrapper = document.getElementById('about-wrapper');
    const aboutTop = aboutWrapper ? aboutWrapper.offsetTop : aboutSection.offsetTop;
    const scrollY = window.scrollY;

    if (scrollY >= aboutTop - 50 && !isSticky) {
      header.classList.add('sticky');
      isSticky = true;
    } else if (scrollY < aboutTop - 50 && isSticky) {
      header.classList.remove('sticky');
      isSticky = false;
    }
  }

  window.addEventListener('scroll', handleScroll);

  // Navigation highlighting functionality (Функционал подсветки навигации)
  const navLinks = document.querySelectorAll('.main-nav a[href^="#"]');
  const sections = document.querySelectorAll('section[id], div[id]');

  function updateActiveNavLink() {
    const scrollY = window.scrollY;
    const windowHeight = window.innerHeight;
    
    // Remove active class from all nav links
    navLinks.forEach(link => link.classList.remove('active'));
    
    // Special case for home section
    if (scrollY < 100) {
      const homeLink = document.querySelector('.main-nav a[href="#"]');
      if (homeLink) {
        homeLink.classList.add('active');
      }
      return; // Выходим, чтобы не активировать другие секции
    }
    
    // Find the current section
    let currentSection = '';
    
    sections.forEach(section => {
      const sectionId = section.getAttribute('id');
      
      // Skip about-wrapper, we'll handle about separately
      if (sectionId === 'about-wrapper') return;
      
      const sectionTop = section.offsetTop - 100;
      const sectionHeight = section.offsetHeight;
      
      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        currentSection = sectionId;
      }
    });
    
    // Special handling for about section inside about-wrapper
    const aboutWrapper = document.getElementById('about-wrapper');
    const aboutSection = document.getElementById('about');
    if (aboutWrapper && aboutSection) {
      const wrapperTop = aboutWrapper.offsetTop - 100;
      const wrapperHeight = aboutWrapper.offsetHeight;
      
      if (scrollY >= wrapperTop && scrollY < wrapperTop + wrapperHeight) {
        currentSection = 'about';
      }
    }
    
    // Add active class to corresponding nav link
    if (currentSection) {
      const activeLink = document.querySelector(`.main-nav a[href="#${currentSection}"]`);
      if (activeLink) {
        activeLink.classList.add('active');
      }
    }
  }

  // Throttle scroll events for better performance (Оптимизация событий прокрутки для лучшей производительности)
  let navTicking = false;
  function requestNavTick() {
    if (!navTicking) {
      requestAnimationFrame(() => {
        updateActiveNavLink();
        navTicking = false;
      });
      navTicking = true;
    }
  }

  window.addEventListener('scroll', requestNavTick);
  
  // Initialize navigation highlighting (Инициализация подсветки навигации)
  updateActiveNavLink();

  // Контроль масштабирования для высоких DPI
  function handleZoom() {
    const viewport = document.querySelector('meta[name="viewport"]');
    if (!viewport) return;
    const scale = window.devicePixelRatio || 1;
    if (scale > 2) {
      viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=2.0, minimum-scale=0.5');
    } else {
      viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=5.0, minimum-scale=0.5');
    }
  }
  window.addEventListener('resize', handleZoom);
  handleZoom();

  // Features slider functionality for horizontal scroll
  const featuresTrack = document.getElementById('features-track');
  const featuresWrapper = document.querySelector('.features-slider-wrapper');
  const featuresPrev = document.getElementById('features-prev');
  const featuresNext = document.getElementById('features-next');
  const featuresDots = document.getElementById('features-dots');

  let featuresCurrentSlide = 0;
  const featuresTotalSlides = 21;

  // Create dots for features
  if (featuresDots) {
    for (let i = 0; i < featuresTotalSlides; i++) {
      const dot = document.createElement('button');
      dot.className = 'features-slider-dot';
      if (i === 0) dot.classList.add('active');
      dot.addEventListener('click', () => goToFeaturesSlide(i));
      featuresDots.appendChild(dot);
    }
  }

function getSlideWidth() {
  const slide = featuresTrack.querySelector('.feature-slide');
  if (!slide) return 820; // fallback
  
  const style = window.getComputedStyle(slide);
  const width = parseFloat(style.width);
  
  // Просто возвращаем ширину слайда + gap (20px)
  return width + 20;
}

  function updateFeaturesSlider() {
    if (!featuresTrack || !featuresWrapper) return;
    
    const slideWidth = getSlideWidth();
    const scrollPosition = featuresCurrentSlide * slideWidth;
    
    featuresWrapper.scrollTo({
      left: scrollPosition,
      behavior: 'smooth'
    });
    
    // Update dots
    if (featuresDots) {
      const dots = featuresDots.querySelectorAll('.features-slider-dot');
      dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === featuresCurrentSlide);
      });
    }
    
    // Update button states
    updateFeaturesButtons();
  }

  function updateFeaturesButtons() {
    if (featuresPrev) {
      featuresPrev.classList.toggle('disabled', featuresCurrentSlide === 0);
    }
    if (featuresNext) {
      featuresNext.classList.toggle('disabled', featuresCurrentSlide === featuresTotalSlides - 1);
    }
  }

  function goToFeaturesSlide(slideIndex) {
    featuresCurrentSlide = Math.min(Math.max(slideIndex, 0), featuresTotalSlides - 1);
    updateFeaturesSlider();
  }

  function nextFeaturesSlide() {
    if (featuresCurrentSlide < featuresTotalSlides - 1) {
      featuresCurrentSlide++;
      updateFeaturesSlider();
    }
  }

  function prevFeaturesSlide() {
    if (featuresCurrentSlide > 0) {
      featuresCurrentSlide--;
      updateFeaturesSlider();
    }
  }

  // Event listeners
  if (featuresNext) {
    featuresNext.addEventListener('click', nextFeaturesSlide);
  }
  if (featuresPrev) {
    featuresPrev.addEventListener('click', prevFeaturesSlide);
  }

  // Обработчик скролла для обновления активного слайда
  if (featuresWrapper) {
    let scrollTimeout;
    
    featuresWrapper.addEventListener('scroll', () => {
      if (!featuresTrack) return;
      
      // Дебаунс скролла для производительности
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const slideWidth = getSlideWidth();
        const scrollLeft = featuresWrapper.scrollLeft;
        const newSlide = Math.round(scrollLeft / slideWidth);
        
        if (newSlide !== featuresCurrentSlide) {
          featuresCurrentSlide = newSlide;
          
          // Update dots
          if (featuresDots) {
            const dots = featuresDots.querySelectorAll('.features-slider-dot');
            dots.forEach((dot, index) => {
              dot.classList.toggle('active', index === featuresCurrentSlide);
            });
          }
          
          updateFeaturesButtons();
        }
      }, 100);
    });
  }

  // Touch events for features slider
  let featuresStartX = 0;
  let featuresStartY = 0;

  if (featuresTrack) {
    featuresTrack.addEventListener('touchstart', (e) => {
      featuresStartX = e.touches[0].clientX;
      featuresStartY = e.touches[0].clientY;
    });
    
    featuresTrack.addEventListener('touchend', (e) => {
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      
      const diffX = featuresStartX - endX;
      const diffY = featuresStartY - endY;
      
      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
        if (diffX > 0) {
          nextFeaturesSlide();
        } else {
          prevFeaturesSlide();
        }
      }
    });
  }

  // Initialize features slider with WebP optimization
  function initFeaturesSlider() {
    const featuresTrack = document.getElementById('features-track');
    if (!featuresTrack) return;
    
    // Убедитесь, что все изображения загружаются правильно
    const featureImages = featuresTrack.querySelectorAll('img');
    featureImages.forEach(img => {
      img.onload = function() {
        this.style.width = '100%';
        this.style.height = '100%';
        this.style.objectFit = 'contain';
      };
      
      // Если изображение уже загружено
      if (img.complete) {
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'contain';
      }
    });
    
    updateFeaturesSlider();
  }

  // Вызовите эту функцию после загрузки DOM
  initFeaturesSlider();

  // Обновление при изменении размера окна
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      updateFeaturesSlider();
    }, 250);
  });

  // WebP Support Detection with caching
  let webPSupportCache = null;
  
  function checkWebPSupport() {
    if (webPSupportCache !== null) {
      return Promise.resolve(webPSupportCache);
    }
    
    return new Promise((resolve) => {
      const webP = new Image();
      webP.onload = webP.onerror = () => {
        webPSupportCache = webP.height === 2;
        resolve(webPSupportCache);
      };
      webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
    });
  }

  // Get optimized image source
  async function getOptimizedImageSrc(originalSrc) {
    const supportsWebP = await checkWebPSupport();
    
    if (supportsWebP) {
      // Заменяем расширение на .webp
      return originalSrc.replace(/\.(jpg|jpeg|png)$/i, '.webp');
    }
    
    return originalSrc;
  }

  // Lazy Loading для секции Media
  function initLazyLoading() {
    // Intersection Observer для секции media
    const mediaContent = document.getElementById('media-content');
    if (mediaContent) {
      const mediaObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('loaded');
            mediaObserver.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.1,
        rootMargin: '50px'
      });
      
      mediaObserver.observe(mediaContent);
    }

    // Intersection Observer для изображений с WebP оптимизацией
    const lazyImages = document.querySelectorAll('.lazy-image');
    if (lazyImages.length > 0) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(async (entry) => {
          if (entry.isIntersecting) {
            const img = entry.target;
            const originalSrc = img.getAttribute('data-src');
            
            if (originalSrc) {
              // Создаем placeholder
              img.style.background = 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)';
              img.style.backgroundSize = '200% 100%';
              img.style.animation = 'loading 1.5s infinite';
              
              try {
                // Получаем оптимизированный источник
                const optimizedSrc = await getOptimizedImageSrc(originalSrc);
                
                // Загружаем изображение
                const newImg = new Image();
                newImg.onload = () => {
                  img.src = optimizedSrc;
                  img.classList.add('loaded');
                  img.style.background = 'none';
                  img.style.animation = 'none';
                };
                newImg.onerror = async () => {
                  // Если WebP не загрузился, пробуем оригинал
                  if (optimizedSrc !== originalSrc) {
                    const fallbackImg = new Image();
                    fallbackImg.onload = () => {
                      img.src = originalSrc;
                      img.classList.add('loaded');
                      img.style.background = 'none';
                      img.style.animation = 'none';
                    };
                    fallbackImg.onerror = () => {
                      img.style.background = 'none';
                      img.style.animation = 'none';
                      console.warn('Failed to load both WebP and fallback image:', originalSrc);
                    };
                    fallbackImg.src = originalSrc;
                  } else {
                    img.style.background = 'none';
                    img.style.animation = 'none';
                    console.warn('Failed to load image:', originalSrc);
                  }
                };
                newImg.src = optimizedSrc;
              } catch (error) {
                console.warn('Error optimizing image:', error);
                // Fallback к оригинальному изображению
                const fallbackImg = new Image();
                fallbackImg.onload = () => {
                  img.src = originalSrc;
                  img.classList.add('loaded');
                  img.style.background = 'none';
                  img.style.animation = 'none';
                };
                fallbackImg.src = originalSrc;
              }
              
              imageObserver.unobserve(img);
            }
          }
        });
      }, {
        threshold: 0.1,
        rootMargin: '100px'
      });

      lazyImages.forEach(img => {
        imageObserver.observe(img);
      });
    }

    // Lazy loading для видео превью с WebP оптимизацией
    const videoPreviews = document.querySelectorAll('.video-preview');
    if (videoPreviews.length > 0) {
      const videoObserver = new IntersectionObserver((entries) => {
        entries.forEach(async (entry) => {
          if (entry.isIntersecting) {
            const videoPreview = entry.target;
            const img = videoPreview.querySelector('img');
            
            if (img && img.classList.contains('lazy-image')) {
              const originalSrc = img.getAttribute('data-src');
              if (originalSrc) {
                try {
                  // Получаем оптимизированный источник
                  const optimizedSrc = await getOptimizedImageSrc(originalSrc);
                  
                  const newImg = new Image();
                  newImg.onload = () => {
                    img.src = optimizedSrc;
                    img.classList.add('loaded');
                    videoPreview.classList.add('loaded');
                  };
                  newImg.onerror = async () => {
                    // Если WebP не загрузился, пробуем оригинал
                    if (optimizedSrc !== originalSrc) {
                      const fallbackImg = new Image();
                      fallbackImg.onload = () => {
                        img.src = originalSrc;
                        img.classList.add('loaded');
                        videoPreview.classList.add('loaded');
                      };
                      fallbackImg.onerror = () => {
                        console.warn('Failed to load both WebP and fallback video preview:', originalSrc);
                      };
                      fallbackImg.src = originalSrc;
                    } else {
                      console.warn('Failed to load video preview:', originalSrc);
                    }
                  };
                  newImg.src = optimizedSrc;
                } catch (error) {
                  console.warn('Error optimizing video preview:', error);
                  // Fallback к оригинальному изображению
                  const fallbackImg = new Image();
                  fallbackImg.onload = () => {
                    img.src = originalSrc;
                    img.classList.add('loaded');
                    videoPreview.classList.add('loaded');
                  };
                  fallbackImg.src = originalSrc;
                }
              }
            }
            
            videoObserver.unobserve(videoPreview);
          }
        });
      }, {
        threshold: 0.1,
        rootMargin: '50px'
      });

      videoPreviews.forEach(preview => {
        videoObserver.observe(preview);
      });
    }
  }

  // Предзагрузка WebP поддержки
  function preloadWebPSupport() {
    checkWebPSupport().then(supportsWebP => {
      // Добавляем класс для CSS fallback
      if (!supportsWebP) {
        document.documentElement.classList.add('no-webp');
        console.log('WebP not supported, using PNG fallbacks');
      } else {
        document.documentElement.classList.add('webp');
        console.log('WebP supported, using WebP images');
      }
      
      // Принудительно обновляем стили
      document.documentElement.style.display = 'none';
      document.documentElement.offsetHeight; // Trigger reflow
      document.documentElement.style.display = '';
    }).catch(error => {
      console.error('WebP detection failed:', error);
      // Fallback to no-webp
      document.documentElement.classList.add('no-webp');
    });
  }


  // Инициализация WebP поддержки как можно раньше
  preloadWebPSupport();
  
  // Инициализация lazy loading
  initLazyLoading();
  

  // Arts section functionality (Функционал секции Arts)
  const artsSlides = document.querySelectorAll('.arts-slide');
  const mainArt = document.getElementById('main-art');
  
  artsSlides.forEach(slide => {
    slide.addEventListener('click', () => {
      // Remove active class from all slides (Удаление активного класса у всех слайдов)
      artsSlides.forEach(s => s.classList.remove('active'));
      
      // Add active class to clicked slide (Добавление активного класса к нажатому слайду)
      slide.classList.add('active');
      
      // Update main art image (Обновление главного изображения арта)
      const artSrc = slide.querySelector('img').src;
      mainArt.src = artSrc;
      
      // Smooth transition effect (Плавный эффект перехода)
      mainArt.style.opacity = '0';
      setTimeout(() => {
        mainArt.style.opacity = '1';
      }, 150);
    });
  });
  
  // Initialize main art opacity (Инициализация прозрачности главного арта)
  if (mainArt) {
    mainArt.style.transition = 'opacity 0.3s ease';
  }
  
  // Touch events for arts vertical slider (События касания для вертикального слайдера arts)
  const artsSlider = document.querySelector('.arts-slider');
  let artsStartY = 0;
  let artsEndY = 0;
  
  if (artsSlider) {
    artsSlider.addEventListener('touchstart', (e) => {
      artsStartY = e.touches[0].clientY;
    });
    
    artsSlider.addEventListener('touchend', (e) => {
      artsEndY = e.changedTouches[0].clientY;
      
      const diffY = artsStartY - artsEndY;
      
      // Проверяем, что это вертикальный свайп
      if (Math.abs(diffY) > 50) {
        if (diffY > 0) {
          // Свайп вверх - прокрутка вниз
          artsSlider.scrollTop += 200;
        } else {
          // Свайп вниз - прокрутка вверх
          artsSlider.scrollTop -= 200;
        }
      }
    });
  }

  // Videos slider functionality (Функционал слайдера Videos)
  const videosTrack = document.getElementById('videos-track');
  const videosPrev = document.getElementById('videos-prev');
  const videosNext = document.getElementById('videos-next');
  const videosDots = document.getElementById('videos-dots');
  
  let videosCurrentSlide = 0;
  const videosTotalSlides = 6; // Total number of video slides (Общее количество видео слайдов)
  const videosSlidesVisible = 1; // Number of slides visible at once (Количество видимых слайдов одновременно)
  const videosMaxSlide = videosTotalSlides - videosSlidesVisible; // Maximum slide index (Максимальный индекс слайда)
  
  // Create dots for videos (Создание точек для видео) - 6 точек для 6 слайдов
  for (let i = 0; i < videosTotalSlides; i++) {
    const dot = document.createElement('button');
    dot.className = 'slider-dot';
    if (i === 0) dot.classList.add('active');
    dot.addEventListener('click', () => goToVideosSlide(i));
    videosDots.appendChild(dot);
  }
  
  const videosDotsElements = videosDots.querySelectorAll('.slider-dot');
  
  function updateVideosSlider() {
    const translateX = -videosCurrentSlide * 100;
    videosTrack.style.transform = `translateX(${translateX}%)`;
    
    // Update dots (Обновление точек)
    videosDotsElements.forEach((dot, index) => {
      dot.classList.toggle('active', index === videosCurrentSlide);
    });
    
    // Update button states (Обновление состояния кнопок)
    videosPrev.classList.toggle('disabled', videosCurrentSlide === 0);
    videosNext.classList.toggle('disabled', videosCurrentSlide === videosMaxSlide);
  }
  
  function goToVideosSlide(slideIndex) {
    videosCurrentSlide = Math.min(Math.max(slideIndex, 0), videosMaxSlide);
    updateVideosSlider();
  }
  
  function nextVideosSlide() {
    if (videosCurrentSlide < videosMaxSlide) {
      videosCurrentSlide++;
      updateVideosSlider();
    }
  }
  
  function prevVideosSlide() {
    if (videosCurrentSlide > 0) {
      videosCurrentSlide--;
      updateVideosSlider();
    }
  }
  
  // Event listeners for videos (Обработчики событий для видео)
  videosNext.addEventListener('click', nextVideosSlide);
  videosPrev.addEventListener('click', prevVideosSlide);
  
  // Touch events for videos slider (События касания для слайдера видео)
  let videosStartX = 0;
  let videosStartY = 0;
  let videosEndX = 0;
  let videosEndY = 0;
  
  videosTrack.addEventListener('touchstart', (e) => {
    videosStartX = e.touches[0].clientX;
    videosStartY = e.touches[0].clientY;
  });
  
  videosTrack.addEventListener('touchend', (e) => {
    videosEndX = e.changedTouches[0].clientX;
    videosEndY = e.changedTouches[0].clientY;
    
    const diffX = videosStartX - videosEndX;
    const diffY = videosStartY - videosEndY;
    
    // Проверяем, что это горизонтальный свайп (не вертикальный)
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
      if (diffX > 0) {
        // Свайп влево - следующий слайд
        nextVideosSlide();
      } else {
        // Свайп вправо - предыдущий слайд
        prevVideosSlide();
      }
    }
  });

  // Videos section video preview click handler (Обработчик кликов на превью видео в секции videos)
  const videosVideoPreviews = document.querySelectorAll('#videos .video-preview');
  videosVideoPreviews.forEach(preview => {
    preview.addEventListener('click', () => {
      const videoId = preview.getAttribute('data-video-id');
      if (videoId) {
        // Set video source with autoplay and other parameters for immediate playback (Установка источника видео с автовоспроизведением и другими параметрами для мгновенного воспроизведения)
        videoFrame.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&showinfo=0&controls=1&start=0`;
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden'; // Prevent background scrolling (Предотвращение прокрутки фона)
        
        // Force video playback (Принудительное воспроизведение видео)
        setTimeout(() => {
          videoFrame.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
        }, 100);
      }
    });
  });


  // Smooth scrolling for navigation links
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href');
      
      if (targetId === '#') {
        // Scroll to top for home link
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      } else if (targetId === '#about') {
        // Special handling for about section
        const aboutWrapper = document.querySelector('#about-wrapper');
        if (aboutWrapper) {
          const offsetTop = aboutWrapper.offsetTop - 80;
          window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
          });
        }
      } else {
        const targetSection = document.querySelector(targetId);
        if (targetSection) {
          const offsetTop = targetSection.offsetTop - 80;
          window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
          });
        }
      }
    });
  });

  // Функционал модального окна для видео
  const modal = document.getElementById('videoModal');
  const videoFrame = document.getElementById('videoFrame');
  const closeBtn = document.querySelector('.close');
  const videoPreviews = document.querySelectorAll('.video-preview:not(#videos .video-preview)');

  // Открытие модального окна при клике на видео-превью
  videoPreviews.forEach(preview => {
    preview.addEventListener('click', () => {
      const videoId = preview.getAttribute('data-video-id');
      if (videoId) {
        // Set video source with autoplay and other parameters for immediate playback   (Установка источника видео с автовоспроизведением и другими параметрами для мгновенного воспроизведения)        
        videoFrame.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&showinfo=0&controls=1&start=0`;
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden'; // Prevent background scrolling (Предотвращение прокрутки фона)
        
        // Force video to start playing immediately (Принудительное воспроизведение видео)
        setTimeout(() => {
          if (videoFrame.contentWindow) {
            videoFrame.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
          }
        }, 100);
      }
    });
  });

  // Close modal when clicking close button (Закрытие модального окна при клике на кнопку закрытия)
  closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
    videoFrame.src = ''; // Stop video (Остановка видео)
    document.body.style.overflow = 'auto'; // Restore scrolling (Восстановление прокрутки)
  });

  // Close modal when clicking outside of it (Закрытие модального окна при клике вне его)
  window.addEventListener('click', (event) => {
    if (event.target === modal) {
      modal.style.display = 'none';
      videoFrame.src = ''; // Stop video (Остановка видео)
      document.body.style.overflow = 'auto'; // Restore scrolling (Восстановление прокрутки)
    }
  });

  // Close modal with Escape key (Закрытие модального окна при нажатии на клавишу Escape)
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modal.style.display === 'block') {
      modal.style.display = 'none';
      videoFrame.src = ''; // Stop video (Остановка видео)
      document.body.style.overflow = 'auto'; // Restore scrolling (Восстановление прокрутки)
    }
  });

  // Media section functionality (Функционал раздела "Медиа")
  const mediaNavBtns = document.querySelectorAll('.media-nav-btn');
  const mediaTabs = document.querySelectorAll('.media-tab');
  
  // Tab switching (Переключение вкладок)
  mediaNavBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');
      
      // Remove active class from all buttons and tabs (Удаление активного класса у всех кнопок и вкладок)
      mediaNavBtns.forEach(b => b.classList.remove('active'));
      mediaTabs.forEach(t => t.classList.remove('active'));
      
      // Add active class to clicked button (Добавление активного класса к нажатой кнопке)
      btn.classList.add('active');
      
      // Add active class to corresponding tab immediately (Добавление активного класса к соответствующей вкладке немедленно)
      const targetTabElement = document.getElementById(targetTab);
      if (targetTabElement) {
        targetTabElement.classList.add('active');
      }
    });
  });

  // Screenshots slider functionality (Функционал слайдера с изображениями)
  const screenshotsTrack = document.getElementById('screenshots-track');
  const screenshotsPrev = document.getElementById('screenshots-prev');
  const screenshotsNext = document.getElementById('screenshots-next');
  const screenshotsDots = document.getElementById('screenshots-dots');

  let currentSlide = 0;
  const totalSlides = 10; // Total number of slides (Общее количество слайдов)

  // Функция для определения количества видимых слайдов
  function getSlidesVisible() {
    return window.innerWidth <= 768 ? 1 : 2; // 1 на мобилках, 2 на десктопе
  }

  // Функция для расчета максимального слайда
  function getMaxSlide() {
    const slidesVisible = getSlidesVisible();
    return Math.max(0, totalSlides - slidesVisible);
  }

  // Функция для обновления ширины слайдов
  function updateSlidesWidth() {
    const slidesVisible = getSlidesVisible();
    const slideWidth = 100 / slidesVisible;
    
    const slides = screenshotsTrack.querySelectorAll('.slide');
    slides.forEach(slide => {
      slide.style.width = `${slideWidth}%`;
      slide.style.minWidth = `${slideWidth}%`;
      slide.style.flexShrink = '0';
    });
  }

  // Create dots (Создание точек) - 5 точек на десктопе, 10 на мобилках
  function createDots() {
    screenshotsDots.innerHTML = '';
    const isMobile = window.innerWidth <= 768;
    const dotsCount = isMobile ? 10 : 5;
    
    for (let i = 0; i < dotsCount; i++) {
      const dot = document.createElement('button');
      dot.className = 'slider-dot';
      
      // На мобилках: каждая точка = 1 слайд, на десктопе: каждая точка = 2 слайда
      const slideIndex = isMobile ? i : i * 2;
      
      // Устанавливаем активное состояние для текущей точки
      if ((isMobile && i === currentSlide) || (!isMobile && i * 2 === currentSlide)) {
        dot.classList.add('active');
      }
      
      dot.addEventListener('click', () => goToSlide(slideIndex));
      screenshotsDots.appendChild(dot);
    }
  }

  // Функция для получения всех точек (должна вызываться после создания точек)
  function getDots() {
    return screenshotsDots.querySelectorAll('.slider-dot');
  }

  function updateSlider() {
    const slidesVisible = getSlidesVisible();
    const maxSlide = getMaxSlide();
    const isMobile = window.innerWidth <= 768;
    
    // Ограничиваем currentSlide в пределах допустимых значений
    currentSlide = Math.min(Math.max(currentSlide, 0), maxSlide);
    
    const translateX = -currentSlide * (100 / slidesVisible);
    screenshotsTrack.style.transform = `translateX(${translateX}%)`;
    
    // Update dots (Обновление точек)
    const dots = getDots();
    dots.forEach((dot, index) => {
      let shouldBeActive = false;
      
      if (isMobile) {
        // На мобилках: каждая точка соответствует 1 слайду
        shouldBeActive = index === currentSlide;
      } else {
        // На десктопе: каждая точка соответствует 2 слайдам
        const dotSlideIndex = index * 2;
        shouldBeActive = currentSlide === dotSlideIndex;
      }
      
      dot.classList.toggle('active', shouldBeActive);
    });
    
    // Update button states (Обновление состояния кнопок)
    screenshotsPrev.classList.toggle('disabled', currentSlide === 0);
    screenshotsNext.classList.toggle('disabled', currentSlide === maxSlide);
  }

  function goToSlide(slideIndex) {
    const maxSlide = getMaxSlide();
    currentSlide = Math.min(Math.max(slideIndex, 0), maxSlide);
    updateSlider();
  }

  function nextSlide() {
    const maxSlide = getMaxSlide();
    const slidesVisible = getSlidesVisible();
    
    if (currentSlide < maxSlide) {
      // На мобилках переключаем по 1 слайду, на десктопе - по 2
      const step = window.innerWidth <= 768 ? 1 : 2;
      currentSlide = Math.min(currentSlide + step, maxSlide);
      updateSlider();
    }
  }

  function prevSlide() {
    if (currentSlide > 0) {
      // На мобилках переключаем по 1 слайду, на десктопе - по 2
      const step = window.innerWidth <= 768 ? 1 : 2;
      currentSlide = Math.max(currentSlide - step, 0);
      updateSlider();
    }
  }

  // Event listeners (Обработчики событий)
  screenshotsNext.addEventListener('click', nextSlide);
  screenshotsPrev.addEventListener('click', prevSlide);

  // Touch events for mobile swipe (События касания для мобильного свайпа)
  let startX = 0;
  let startY = 0;
  let endX = 0;
  let endY = 0;

  screenshotsTrack.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
  });

  screenshotsTrack.addEventListener('touchend', (e) => {
    endX = e.changedTouches[0].clientX;
    endY = e.changedTouches[0].clientY;
    
    const diffX = startX - endX;
    const diffY = startY - endY;
    
    // Проверяем, что это горизонтальный свайп (не вертикальный)
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
      if (diffX > 0) {
        // Свайп влево - следующий слайд
        nextSlide();
      } else {
        // Свайп вправо - предыдущий слайд
        prevSlide();
      }
    }
  });

  // Обработчик изменения размера окна
  let lastIsMobile = window.innerWidth <= 768;

  function handleResize() {
    const isMobile = window.innerWidth <= 768;
    
    updateSlidesWidth();
    
    // Если изменился режим (мобильный/десктоп), пересоздаем точки
    if (lastIsMobile !== isMobile) {
      createDots();
      lastIsMobile = isMobile;
      
      // Корректируем currentSlide при переходе между режимами
      if (isMobile && currentSlide % 2 !== 0) {
        // При переходе на мобильный режим, если currentSlide нечетный, делаем его четным
        currentSlide = Math.max(0, currentSlide - 1);
      }
    }
    
    updateSlider();
  }

  // Initialize (Инициализация)
  function initScreenshotsSlider() {
    lastIsMobile = window.innerWidth <= 768;
    updateSlidesWidth();
    createDots();
    updateSlider();
    
    // Добавляем обработчик изменения размера окна
    window.addEventListener('resize', handleResize);
  }

  // Запускаем инициализацию
  initScreenshotsSlider();

  // Image Modal functionality (Функционал модального окна для изображений)
  const imageModal = document.getElementById('imageModal');
  const modalImage = document.getElementById('modalImage');
  const imageCloseBtn = imageModal.querySelector('.close');
  const slideImages = document.querySelectorAll('.slide img:not(#videos .slide img)');
  const modalPrev = document.getElementById('modal-prev');
  const modalNext = document.getElementById('modal-next');
  const modalDots = document.getElementById('modal-dots');
  
  let modalCurrentSlide = 0;
  const modalTotalSlides = 10;

  // Create modal dots (Создание точек для модального окна)
  for (let i = 0; i < modalTotalSlides; i++) {
    const dot = document.createElement('button');
    dot.className = 'modal-slider-dot';
    if (i === 0) dot.classList.add('active');
    dot.addEventListener('click', () => goToModalSlide(i));
    modalDots.appendChild(dot);
  }
  
  const modalDotsElements = modalDots.querySelectorAll('.modal-slider-dot');

  // Функция для принудительной загрузки всех изображений в модальном окне
  async function preloadModalImages() {
    const slideImagesArray = Array.from(slideImages);
    
    for (let i = 0; i < slideImagesArray.length; i++) {
      const img = slideImagesArray[i];
      const originalSrc = img.getAttribute('data-src');
      
      if (originalSrc && !img.src) {
        try {
          // Получаем оптимизированный источник
          const optimizedSrc = await getOptimizedImageSrc(originalSrc);
          
          // Загружаем изображение
          const newImg = new Image();
          newImg.onload = () => {
            img.src = optimizedSrc;
            img.classList.add('loaded');
          };
          newImg.onerror = async () => {
            // Если WebP не загрузился, пробуем оригинал
            if (optimizedSrc !== originalSrc) {
              const fallbackImg = new Image();
              fallbackImg.onload = () => {
                img.src = originalSrc;
                img.classList.add('loaded');
              };
              fallbackImg.src = originalSrc;
            }
          };
          newImg.src = optimizedSrc;
        } catch (error) {
          console.error('Error loading image:', error);
          // Fallback к оригинальному источнику
          img.src = originalSrc;
        }
      }
    }
  }

  function updateModalSlider() {
    const slideImagesArray = Array.from(slideImages);
    if (slideImagesArray[modalCurrentSlide]) {
      modalImage.src = slideImagesArray[modalCurrentSlide].src;
      modalImage.alt = slideImagesArray[modalCurrentSlide].alt;
    }
    
    // Update modal dots (Обновление точек модального окна)
    modalDotsElements.forEach((dot, index) => {
      dot.classList.toggle('active', index === modalCurrentSlide);
    });
    
    // Update modal button states (Обновление состояния кнопок модального окна)
    modalPrev.classList.toggle('disabled', modalCurrentSlide === 0);
    modalNext.classList.toggle('disabled', modalCurrentSlide === modalTotalSlides - 1);
  }
  
  function goToModalSlide(slideIndex) {
    modalCurrentSlide = slideIndex;
    updateModalSlider();
  }
  
  function nextModalSlide() {
    if (modalCurrentSlide < modalTotalSlides - 1) {
      modalCurrentSlide++;
      updateModalSlider();
    }
  }
  
  function prevModalSlide() {
    if (modalCurrentSlide > 0) {
      modalCurrentSlide--;
      updateModalSlider();
    }
  }

  // Open image modal when clicking on slide image (Открытие модального окна изображения при клике на слайд)
  slideImages.forEach((img, index) => {
    img.addEventListener('click', async () => {
      modalCurrentSlide = index;
      
      // Принудительно загружаем все изображения для модального окна
      await preloadModalImages();
      
      updateModalSlider();
      imageModal.style.display = 'block';
      document.body.style.overflow = 'hidden'; // Prevent background scrolling (Предотвращение прокрутки фона)
    });
  });

  // Modal navigation event listeners (Обработчики событий навигации модального окна)
  modalNext.addEventListener('click', nextModalSlide);
  modalPrev.addEventListener('click', prevModalSlide);

  // Close image modal when clicking close button (Закрытие модального окна изображения при клике на кнопку закрытия)
  imageCloseBtn.addEventListener('click', () => {
    imageModal.style.display = 'none';
    document.body.style.overflow = 'auto'; // Restore scrolling (Восстановление прокрутки)
  });

  // Close image modal when clicking outside of it (Закрытие модального окна изображения при клике вне его)
  window.addEventListener('click', (event) => {
    if (event.target === imageModal) {
      imageModal.style.display = 'none';
      document.body.style.overflow = 'auto'; // Restore scrolling (Восстановление прокрутки)
    }
  });

  // Close image modal with Escape key and keyboard navigation (Закрытие модального окна изображения при нажатии на клавишу Escape и навигация с клавиатуры)
  document.addEventListener('keydown', (event) => {
    if (imageModal.style.display === 'block') {
      if (event.key === 'Escape') {
        imageModal.style.display = 'none';
        document.body.style.overflow = 'auto'; // Restore scrolling (Восстановление прокрутки)
      } else if (event.key === 'ArrowLeft') {
        prevModalSlide();
      } else if (event.key === 'ArrowRight') {
        nextModalSlide();
      }
    }
  });


});