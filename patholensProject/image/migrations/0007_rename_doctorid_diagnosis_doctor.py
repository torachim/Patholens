# Generated by Django 5.1.3 on 2024-12-07 18:11

from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ("image", "0006_rename_userid_diagnosis_doctorid_and_more"),
    ]

    operations = [
        migrations.RenameField(
            model_name="diagnosis",
            old_name="doctorID",
            new_name="doctor",
        ),
    ]
