"use client";

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import Image from 'next/image';
import { Menu } from '@/types';

// Importar estilos do Swiper
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

type MenuCarouselProps = {
  images: Menu[];
};

export default function MenuCarousel({ images }: MenuCarouselProps) {
  if (images.length === 0) {
    return (
      <div className="bg-gray-100 rounded-lg p-8 text-center">
        <p className="text-gray-500">Nenhuma imagem de cardápio disponível no momento.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        spaceBetween={0}
        slidesPerView={1}
        navigation
        pagination={{ clickable: true }}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        className="rounded-lg overflow-hidden"
      >
        {images.map((image) => (
          <SwiperSlide key={image.id}>
            <div className="relative aspect-[4/3] w-full">
              <Image
                src={image.image_url}
                alt="Imagem do cardápio"
                fill
                sizes="100vw"
                priority
                className="object-contain"
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}