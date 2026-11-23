create table IF NOT EXISTS `info_points` (
  `id` int unsigned not null auto_increment primary key,
  `created_at` timestamp not null default CURRENT_TIMESTAMP,
  `updated_at` timestamp not null default CURRENT_TIMESTAMP,
  `time` TIME null,
  `title` varchar(255) null,
  `description` varchar(255) null,
  `ambient_path` varchar(255) null,
  `voice_path` varchar(255) null
);

create table IF NOT EXISTS `info_images` (
  `id` int unsigned not null auto_increment primary key,
  `created_at` timestamp not null default CURRENT_TIMESTAMP,
  `updated_at` timestamp not null default CURRENT_TIMESTAMP,
  `info_point_id` int unsigned not null,
  `image_path` varchar(255) null,
  foreign key (`info_point_id`) references `info_points` (`id`) on delete cascade
);