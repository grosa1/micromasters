# Generated by Django 2.1.2 on 2018-12-14 21:58

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('dashboard', '0008_programenrollment_hash'),
    ]

    operations = [
        migrations.AlterField(
            model_name='programenrollment',
            name='hash',
            field=models.CharField(max_length=32, unique=True),
        ),
    ]
