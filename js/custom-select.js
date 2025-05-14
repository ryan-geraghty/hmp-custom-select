(function ($, Drupal, once) {
  'use strict';

  Drupal.behaviors.wcbnDropdowns = {
    attach: function (context, settings) {
      $(context).find('.dropdown-container.open')
        .removeClass('open')
        .find('.dropdown-options').hide();
      once('select-box-theme', '.form-type-select', context).forEach(function(element) {
        const $wrapper = $(element);
        const $selectElement = $wrapper.find('select');

        $selectElement.css({
          'position': 'absolute',
          'opacity': '0',
          'z-index': '-1',
          'width': '1px',
          'height': '1px',
          'overflow': 'hidden'
        });

        const $dropdownContainer = $('<div class="dropdown-container"></div>');
        const $dropdownAppearance = $('<div class="dropdown-appearance"><div class="dropdown-value-container"><div class="dropdown-value">Select</div><div class="values-container"></div></div><div class="dropdown-arrow"><svg viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"></path></svg></div></div>');
        $dropdownContainer.append($dropdownAppearance);
        $selectElement.after($dropdownContainer);

        const $tagsContainer = $dropdownAppearance.find('.values-container');
        const $dropdownValue = $dropdownAppearance.find('.dropdown-value');

        const $dropdownOptions = $('<div class="dropdown-options"></div>');
        $dropdownContainer.append($dropdownOptions);
        $dropdownOptions.hide();


        function updateTagDisplay() {
          $tagsContainer.empty();

          const selectedOptions = $selectElement.find('option:selected');

          if (selectedOptions.length > 0) {
            $dropdownValue.hide();

            selectedOptions.each(function() {
              const value = $(this).val();
              const text = $(this).text();
              const $tag = $('<div class="option" data-value="' + value + '">' + text + '</div>');
              $tagsContainer.append($tag);

              // $tag.find('.remove-tag').on('click', function(e) {
              //   e.stopPropagation();
              //   $selectElement.find('option[value="' + value + '"]').prop('selected', false);
              //   $selectElement.trigger('change');
              //   $dropdownOptions.find('.dropdown-item[data-value="' + value + '"]').removeClass('selected');
              // });
            });
          } else {
            $dropdownValue.show();
          }
        }

        function populateDropdownOptions() {
          $dropdownOptions.empty();
          $selectElement.find('option').each(function() {
            const value = $(this).val();
            const text = $(this).text();
            const isSelected = $(this).is(':selected');

            const $option = $('<div class="dropdown-item ' + (isSelected ? 'selected' : '') + '" data-value="' + value + '">' + text + '</div>');
            $dropdownOptions.append($option);

            $option.on('click', function(e) {
              e.stopPropagation();
              const optionValue = $(this).data('value');
              const $option = $selectElement.find('option[value="' + optionValue + '"]');
              $option.prop('selected', 'selected');
              $(this).addClass('selected');
              closeSelect();
              $selectElement.trigger('change');

              $(document).one('ajaxComplete', function() {
                focusNextElement();
              });

              return false;
            });
          });
        }

        populateDropdownOptions();
        updateTagDisplay();


        $selectElement
        .on('focus', () => {
          if(!$selectElement.attr('data-once')) {
            openSelect();
          }

        })
        .on('blur', () => {
          setTimeout(() => {
            closeSelect();
          }, 100);
        });



        // Hijack default behaviors
        $selectElement.on('keydown', function(e) {

          // find current highlight
          var $current = $(element).filter('.highlight');
          var idx      = $(element).index($current);
          var items    = $(element).find('.dropdown-item');


          if (e.key === 'ArrowDown') {
            e.preventDefault();
            var items = $(element).find('.dropdown-item');
            var current = items.filter('.dropdown-item.highlight');
            if(!current.length) {
              var current = items.filter('.dropdown-item.selected');
            }
            var next = current.next();
            current.removeClass('highlight');
            next.addClass('highlight');
            scrollToSpot('.highlight');

          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            var items = $(element).find('.dropdown-item');
            var current = items.filter('.dropdown-item.highlight');
            if(!current.length) {
              var current = items.filter('.dropdown-item.selected');
            }
            var next = current.previous();
            current.removeClass('highlight');
            next.addClass('highlight');
            scrollToSpot('.highlight');

          } else if (e.key === 'Enter') {
            e.preventDefault();
            items.filter('.highlight').trigger('click');

          } else if (e.key === 'Escape') {
            e.preventDefault();
            close();
          }
        });

        // Open the dropdown list on an initial click
        $dropdownAppearance.on('click', function(e) {
          e.stopPropagation();
          if (!$dropdownOptions.is(':visible')) {
            $('.dropdown-options').hide();
            $('.dropdown-appearance.open').removeClass('open');
          }
          openSelect();
          // $selectElement.focus();
        });

        // Clicking on anywhere else, close the select
        $(document).on('click', function(e) {
          if (!$(e.target).closest($wrapper).length) {
            closeSelect();
          }
        });

        $selectElement.on('change', function() {
          updateTagDisplay();
          $selectElement.find('option').each(function() {
            const value = $(this).val();
            const isSelected = $(this).is(':selected');
            $dropdownOptions.find('.dropdown-item[data-value="' + value + '"]')
              .toggleClass('selected', isSelected);
          });
          focusNextElement();
        });

        function openSelect() {
          $dropdownOptions.slideToggle(100, function() {
            scrollToSpot();
          });
          $dropdownAppearance.toggleClass('open');
        }

        function closeSelect() {
          $dropdownOptions.slideUp(100);
          $dropdownAppearance.removeClass('open');
        }

        function scrollToSpot($selector = '.selected') {
          if ($dropdownOptions.is(':visible')) {
            var $selectedOption = $dropdownOptions.find($selector);
            if ($selectedOption.length) {
              var currentScroll  = $dropdownOptions.scrollTop();
              var optionTop      = $selectedOption.position().top;
              var containerH     = $dropdownOptions.innerHeight();
              var optionH        = $selectedOption.outerHeight();
              var scrollTo       = currentScroll + optionTop - (containerH/2) + (optionH/2);
              $dropdownOptions.scrollTop(scrollTo);
            }
          }
        }

        function focusNextElement() {
          const $formControls = $selectElement
            .closest('form')
            .find('input, select, textarea, button')
            .filter(':enabled')
            .filter('[tabindex!="-1"]');

          const idx = $formControls.index($selectElement);
          const $next = $formControls.eq(idx + 1);
          if ($next.length) {
            $next.focus();
          }
        }


      });
    }
  };

})(jQuery, Drupal, once);
