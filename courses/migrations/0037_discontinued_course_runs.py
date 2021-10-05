# Generated by Django 2.2.24 on 2021-09-30 18:02

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('courses', '0036_courserun_courseware_backend'),
    ]

    operations = [
        migrations.AddField(
            model_name='courserun',
            name='is_discontinued',
            field=models.BooleanField(default=False, help_text='Setting this to true will discontinue the course run, which will cause it to no longer be actionable.'),
        ),
        migrations.AddIndex(
            model_name='courserun',
            index=models.Index(fields=['id', 'is_discontinued'], name='courses_cou_id_2ef473_idx'),
        ),
        migrations.AddIndex(
            model_name='courserun',
            index=models.Index(fields=['course', 'is_discontinued'], name='courses_cou_course__1a4504_idx'),
        ),
    ]