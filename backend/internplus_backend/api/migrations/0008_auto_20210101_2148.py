# Generated by Django 3.1.4 on 2021-01-01 21:48

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0007_review_salary_usd'),
    ]

    operations = [
        migrations.AddField(
            model_name='review',
            name='is_live',
            field=models.BooleanField(default=False),
        ),
        migrations.AlterField(
            model_name='review',
            name='author',
            field=models.EmailField(blank=True, max_length=254, null=True),
        ),
    ]