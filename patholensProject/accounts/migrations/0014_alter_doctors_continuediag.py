# Generated by Django 5.1.3 on 2025-03-22 21:25

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0013_alter_doctors_continuediag_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='doctors',
            name='continueDiag',
            field=models.JSONField(blank=True, default=dict, null=True),
        ),
    ]
