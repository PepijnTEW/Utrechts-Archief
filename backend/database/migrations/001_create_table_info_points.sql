create table IF NOT EXISTS `info_points` (
  `id` int unsigned not null auto_increment primary key,
  `created_at` timestamp not null default NOW(),
  `updated_at` timestamp not null default NOW(),
  `time` TIME null,
  `title` varchar(255) null,
  `ambient_path` varchar(255) null,
  `voice_path` varchar(255) null,
  `img_path` varchar(255) null
)